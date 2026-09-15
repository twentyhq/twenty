/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { MAX_SEATS_WITHOUT_ENTERPRISE_KEY } from 'src/engine/core-modules/enterprise/constants/max-seats-without-enterprise-key.constant';
import {
  EnterpriseException,
  EnterpriseExceptionCode,
} from 'src/engine/core-modules/enterprise/enterprise.exception';
import {
  type CustomAiProviderAccess,
  CustomAiProviderAccessService,
} from 'src/engine/core-modules/enterprise/services/custom-ai-provider-access.service';
import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { DefaultAiCatalogService } from 'src/engine/metadata-modules/ai/ai-models/services/default-ai-catalog.service';
import { aiProviderConfigSchema } from 'src/engine/metadata-modules/ai/ai-models/types/ai-provider-config.schema';
import { aiProviderModelConfigSchema } from 'src/engine/metadata-modules/ai/ai-models/types/ai-provider-model-config.schema';
import { type AiProviderModelConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-provider-model-config.type';
import { extractConfigVariableName } from 'src/engine/metadata-modules/ai/ai-models/utils/extract-config-variable-name.util';

const PROVIDER_NAME_PATTERN = /^[a-zA-Z0-9_-]+$/;

@Injectable()
export class AdminPanelAiProviderService {
  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly customAiProviderAccessService: CustomAiProviderAccessService,
    private readonly aiModelRegistryService: AiModelRegistryService,
    private readonly defaultAiCatalogService: DefaultAiCatalogService,
  ) {}

  // Counting here rather than reading the cached verdict keeps the admin panel
  // exact, and refreshes what model resolution will use on its next read.
  async getCustomAiProviderAccess(): Promise<CustomAiProviderAccess> {
    return this.customAiProviderAccessService.computeAccess();
  }

  private async assertCustomAiProviderAccess(): Promise<void> {
    const { hasAccess, seatCount } = await this.getCustomAiProviderAccess();

    if (hasAccess) {
      return;
    }

    throw new EnterpriseException(
      `Custom AI providers require a valid enterprise key above ${MAX_SEATS_WITHOUT_ENTERPRISE_KEY} seats (this instance has ${seatCount})`,
      EnterpriseExceptionCode.ENTERPRISE_SEAT_THRESHOLD_EXCEEDED,
    );
  }

  getMaskedProviders(): Record<string, unknown> {
    const providers =
      this.aiModelRegistryService.getResolvedProvidersForAdmin();
    const catalogNames = this.aiModelRegistryService.getCatalogProviderNames();
    const rawCatalog = this.defaultAiCatalogService.getDefaultAiCatalog();
    const masked: Record<string, Record<string, unknown>> = {};

    for (const [key, config] of Object.entries(providers)) {
      const isCatalog = catalogNames.has(key);
      const rawConfig = isCatalog ? rawCatalog[key] : undefined;
      const apiKeyConfigVariable = rawConfig
        ? extractConfigVariableName(rawConfig.apiKey)
        : undefined;

      masked[key] = {
        npm: config.npm,
        label: config.label ?? key,
        source: isCatalog ? 'catalog' : 'custom',
        ...(config.authType && { authType: config.authType }),
        ...(config.name && { name: config.name }),
        ...(config.baseUrl && { baseUrl: config.baseUrl }),
        ...(config.region && { region: config.region }),
        ...(config.dataResidency && { dataResidency: config.dataResidency }),
        ...(config.apiKey && {
          apiKey: `${config.apiKey.substring(0, 8)}...`,
        }),
        ...(apiKeyConfigVariable && { apiKeyConfigVariable }),
        hasAccessKey: !!(config.accessKeyId && config.secretAccessKey),
      };
    }

    return masked;
  }

  // Both configs arrive as untyped JSON from the GraphQL layer, so they are
  // taken as unknown and given their shape by the schemas below.
  async addProvider({
    providerName,
    providerConfig,
  }: {
    providerName: string;
    providerConfig: unknown;
  }): Promise<boolean> {
    await this.assertCustomAiProviderAccess();

    if (!PROVIDER_NAME_PATTERN.test(providerName)) {
      throw new UserInputError('Invalid provider name');
    }

    // The GraphQL arg is untyped JSON, so an unsupported npm package would only
    // surface later when the registry builds the provider, taking down model
    // resolution for every provider on the instance.
    const validatedProviderConfig =
      aiProviderConfigSchema.safeParse(providerConfig);

    if (!validatedProviderConfig.success) {
      throw new UserInputError(
        `Invalid provider configuration: ${validatedProviderConfig.error.issues
          .map((issue) => `${issue.path.join('.')} ${issue.message}`)
          .join(', ')}`,
      );
    }

    const customProviders = {
      ...this.twentyConfigService.get('AI_PROVIDERS'),
    };

    customProviders[providerName] = validatedProviderConfig.data;
    await this.twentyConfigService.set('AI_PROVIDERS', customProviders);

    return true;
  }

  // Removal stays open so an instance that grows past the threshold can still
  // clean up the providers it configured while it was under it.
  async removeProvider(providerName: string): Promise<boolean> {
    const customProviders = {
      ...this.twentyConfigService.get('AI_PROVIDERS'),
    };

    delete customProviders[providerName];
    await this.twentyConfigService.set('AI_PROVIDERS', customProviders);

    return true;
  }

  async addModelToProvider({
    providerName,
    modelConfig,
  }: {
    providerName: string;
    modelConfig: unknown;
  }): Promise<boolean> {
    await this.assertCustomAiProviderAccess();

    const validatedModelConfig =
      aiProviderModelConfigSchema.safeParse(modelConfig);

    if (!validatedModelConfig.success) {
      throw new UserInputError(
        `Invalid model configuration: ${validatedModelConfig.error.issues
          .map((issue) => `${issue.path.join('.')} ${issue.message}`)
          .join(', ')}`,
      );
    }

    const customProviders = {
      ...this.twentyConfigService.get('AI_PROVIDERS'),
    };

    const existing = customProviders[providerName];

    if (!existing) {
      throw new UserInputError(
        `Provider "${providerName}" not found in custom providers`,
      );
    }

    const existingModels = existing.models ?? [];
    const alreadyExists = existingModels.some(
      (model: AiProviderModelConfig) =>
        model.name === validatedModelConfig.data.name,
    );

    if (alreadyExists) {
      throw new UserInputError(
        `Model "${validatedModelConfig.data.name}" already exists on provider "${providerName}"`,
      );
    }

    customProviders[providerName] = {
      ...existing,
      models: [
        ...existingModels,
        { ...validatedModelConfig.data, source: 'manual' },
      ],
    };

    await this.twentyConfigService.set('AI_PROVIDERS', customProviders);

    return true;
  }

  async removeModelFromProvider({
    providerName,
    modelName,
  }: {
    providerName: string;
    modelName: string;
  }): Promise<boolean> {
    const customProviders = {
      ...this.twentyConfigService.get('AI_PROVIDERS'),
    };

    const existing = customProviders[providerName];

    if (!existing) {
      throw new UserInputError(
        `Provider "${providerName}" not found in custom providers`,
      );
    }

    const existingModels = existing.models ?? [];

    customProviders[providerName] = {
      ...existing,
      models: existingModels.filter(
        (model: AiProviderModelConfig) => model.name !== modelName,
      ),
    };

    await this.twentyConfigService.set('AI_PROVIDERS', customProviders);

    return true;
  }
}
