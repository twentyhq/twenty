import { useMemo } from 'react';

import { useMutation, useQuery } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { Tag } from 'twenty-ui/components';
import { H2Title, IconBolt, IconLock, IconRobot } from 'twenty-ui/display';
import { Card, Section } from 'twenty-ui/layout';

import { useClientConfig } from '@/client-config/hooks/useClientConfig';
import { SettingsAdminAiModelsTable } from '@/settings/admin-panel/ai/components/SettingsAdminAiModelsTable';
import { SettingsAdminAiProviderListCard } from '@/settings/admin-panel/ai/components/SettingsAdminAiProviderListCard';
import { AI_PROVIDER_SOURCE } from '@/settings/admin-panel/ai/constants/AiProviderSource';
import { SET_ADMIN_AI_MODEL_RECOMMENDED } from '@/settings/admin-panel/ai/graphql/mutations/setAdminAiModelRecommended';
import { SET_ADMIN_DEFAULT_AI_MODEL } from '@/settings/admin-panel/ai/graphql/mutations/setAdminDefaultAiModel';
import { GET_ADMIN_AI_MODELS } from '@/settings/admin-panel/ai/graphql/queries/getAdminAiModels';
import { GET_AI_PROVIDERS } from '@/settings/admin-panel/ai/graphql/queries/getAiProviders';
import { type GetAiProvidersResult } from '@/settings/admin-panel/ai/types/GetAiProvidersResult';
import { getModelIcon } from '@/settings/admin-panel/ai/utils/getModelIcon';
import { parseProviderItems } from '@/settings/admin-panel/ai/utils/parseProviderItems';
import { SettingsAdminTabSkeletonLoader } from '@/settings/admin-panel/components/SettingsAdminTabSkeletonLoader';
import { SettingsOptionCardContentSelect } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSelect';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Select } from '@/ui/input/components/Select';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import {
  AiModelRole,
  type AdminAiModelConfig,
} from '~/generated-metadata/graphql';

export const SettingsAdminAI = () => {
  const { enqueueErrorSnackBar } = useSnackBar();
  const { refetch: refetchClientConfig } = useClientConfig();

  const { data, loading: isLoadingModels } = useQuery<{
    getAdminAiModels: {
      defaultSmartModelId?: string | null;
      defaultFastModelId?: string | null;
      models: AdminAiModelConfig[];
    };
  }>(GET_ADMIN_AI_MODELS);

  const [setModelRecommended] = useMutation(SET_ADMIN_AI_MODEL_RECOMMENDED);
  const [setDefaultModel] = useMutation(SET_ADMIN_DEFAULT_AI_MODEL);

  const { data: providersData, loading: isLoadingProviders } =
    useQuery<GetAiProvidersResult>(GET_AI_PROVIDERS);

  const models = data?.getAdminAiModels?.models ?? [];

  const providerItems = useMemo(
    () => parseProviderItems(providersData?.getAiProviders ?? {}),
    [providersData],
  );

  const catalogProviders = useMemo(
    () =>
      providerItems
        .filter((provider) => provider.source === AI_PROVIDER_SOURCE.CATALOG)
        .sort((a, b) => (a.label ?? a.id).localeCompare(b.label ?? b.id)),
    [providerItems],
  );

  const customProviders = providerItems.filter(
    (provider) => provider.source === AI_PROVIDER_SOURCE.CUSTOM,
  );

  if (isLoadingProviders || isLoadingModels) {
    return <SettingsAdminTabSkeletonLoader />;
  }

  const handleRecommendedToggle = async (
    modelId: string,
    isCurrentlyRecommended: boolean,
  ) => {
    try {
      await setModelRecommended({
        variables: { modelId, recommended: !isCurrentlyRecommended },
        refetchQueries: [{ query: GET_ADMIN_AI_MODELS }],
      });
      await refetchClientConfig();
    } catch {
      enqueueErrorSnackBar({
        message: t`Failed to update model recommendation`,
      });
    }
  };

  const defaultSmartModelId = data?.getAdminAiModels?.defaultSmartModelId;
  const defaultFastModelId = data?.getAdminAiModels?.defaultFastModelId;

  const enabledModels = models.filter(
    (model) => model.isAvailable && model.isAdminEnabled && !model.isDeprecated,
  );

  const availableModelOptions = enabledModels.map((model) => ({
    value: model.modelId,
    label: model.label,
    Icon: getModelIcon(model.modelFamily, model.providerName),
  }));

  const handleDefaultModelChange = async (
    role: AiModelRole,
    modelId: string,
  ) => {
    try {
      await setDefaultModel({
        variables: { role, modelId },
        refetchQueries: [{ query: GET_ADMIN_AI_MODELS }],
      });
      await refetchClientConfig();
    } catch {
      enqueueErrorSnackBar({
        message: t`Failed to update default model`,
      });
    }
  };

  return (
    <>
      <Section>
        <H2Title
          title={t`Providers`}
          description={t`Built-in providers activated by API key. Click to manage models.`}
        />

        <SettingsAdminAiProviderListCard
          providers={catalogProviders}
          showAddButton={false}
        />
      </Section>

      <Section>
        <H2Title
          title={t`Custom Providers`}
          description={t`Add custom endpoints, private gateways, or additional regions.`}
          adornment={
            <Tag
              text={t`Enterprise`}
              color="transparent"
              Icon={IconLock}
              variant="border"
            />
          }
        />

        <SettingsAdminAiProviderListCard
          providers={customProviders}
          showAddButton
        />
      </Section>

      {availableModelOptions.length > 0 && (
        <Section>
          <H2Title
            title={t`Default Models`}
            description={t`Configure the default AI models for all workspaces`}
          />

          <Card rounded>
            <SettingsOptionCardContentSelect
              Icon={IconRobot}
              title={t`Smart Model`}
              description={t`Default model for chats and complex reasoning`}
            >
              <Select
                dropdownId="admin-smart-model-select"
                value={defaultSmartModelId ?? undefined}
                onChange={(value: string) =>
                  handleDefaultModelChange(AiModelRole.SMART, value)
                }
                options={availableModelOptions}
                selectSizeVariant="small"
                dropdownWidth={GenericDropdownContentWidth.ExtraLarge}
              />
            </SettingsOptionCardContentSelect>
            <SettingsOptionCardContentSelect
              Icon={IconBolt}
              title={t`Fast Model`}
              description={t`Default model for lightweight tasks`}
            >
              <Select
                dropdownId="admin-fast-model-select"
                value={defaultFastModelId ?? undefined}
                onChange={(value: string) =>
                  handleDefaultModelChange(AiModelRole.FAST, value)
                }
                options={availableModelOptions}
                selectSizeVariant="small"
                dropdownWidth={GenericDropdownContentWidth.ExtraLarge}
              />
            </SettingsOptionCardContentSelect>
          </Card>
        </Section>
      )}

      {enabledModels.length > 0 && (
        <Section>
          <H2Title
            title={t`Recommended Models`}
            description={t`Select which models appear as recommended in the workspace model picker`}
          />

          <SettingsAdminAiModelsTable
            models={enabledModels}
            onToggle={handleRecommendedToggle}
            checkedField="isRecommended"
            anchorPrefix="recommended-model-row"
          />
        </Section>
      )}
    </>
  );
};
