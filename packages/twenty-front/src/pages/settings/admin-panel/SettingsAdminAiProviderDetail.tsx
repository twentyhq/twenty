import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useMutation, useQuery } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';

import { AI_ADMIN_PATH } from '@/settings/admin-panel/ai/constants/AiAdminPath';
import {
  H2Title,
  type IconComponent,
  IconFlag,
  IconKey,
  IconPlug,
  IconPlus,
  IconServer,
  IconTag,
  IconTrash,
  IconWorld,
} from 'twenty-ui/display';
import { Button, SearchInput } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { RoundedLink, UndecoratedLink } from 'twenty-ui/navigation';

import { useClientConfig } from '@/client-config/hooks/useClientConfig';
import { SettingsAdminAiModelsTable } from '@/settings/admin-panel/ai/components/SettingsAdminAiModelsTable';
import { REMOVE_MODEL_FROM_PROVIDER } from '@/settings/admin-panel/ai/graphql/mutations/removeModelFromProvider';
import { REMOVE_AI_PROVIDER } from '@/settings/admin-panel/ai/graphql/mutations/removeAiProvider';
import { GET_ADMIN_AI_MODELS } from '@/settings/admin-panel/ai/graphql/queries/getAdminAiModels';
import { GET_AI_PROVIDERS } from '@/settings/admin-panel/ai/graphql/queries/getAiProviders';
import { type GetAiProvidersResult } from '@/settings/admin-panel/ai/types/GetAiProvidersResult';
import { type RawAiProviderConfig } from '@/settings/admin-panel/ai/types/RawAiProviderConfig';
import { getDataResidencyDisplay } from '@/settings/admin-panel/ai/utils/getDataResidencyDisplay';
import { SettingsAdminTableCard } from '@/settings/admin-panel/components/SettingsAdminTableCard';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import {
  type AdminAiModelConfig,
  SetAdminAiModelEnabledDocument,
} from '~/generated-metadata/graphql';

const REMOVE_PROVIDER_MODAL_ID = 'settings-ai-provider-remove';
const REMOVE_MODEL_MODAL_ID = 'settings-ai-model-remove';

export const SettingsAdminAiProviderDetail = () => {
  const { providerName } = useParams<{ providerName: string }>();
  const navigate = useNavigate();
  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();
  const { refetch: refetchClientConfig } = useClientConfig();
  const { openModal } = useModal();
  const [searchQuery, setSearchQuery] = useState('');
  const [modelToRemove, setModelToRemove] = useState<{
    modelId: string;
    label: string;
    rawModelId: string;
  } | null>(null);

  const { data: providersData } =
    useQuery<GetAiProvidersResult>(GET_AI_PROVIDERS);

  const { data: modelsData } = useQuery<{
    getAdminAiModels: {
      models: AdminAiModelConfig[];
    };
  }>(GET_ADMIN_AI_MODELS);

  const [setModelEnabled] = useMutation(SetAdminAiModelEnabledDocument);
  const [removeAiProvider] = useMutation(REMOVE_AI_PROVIDER);
  const [removeModelFromProvider] = useMutation(REMOVE_MODEL_FROM_PROVIDER);

  const handleRemoveProvider = async () => {
    if (!providerName) {
      return;
    }

    try {
      await removeAiProvider({
        variables: { providerName },
        refetchQueries: [
          { query: GET_AI_PROVIDERS },
          { query: GET_ADMIN_AI_MODELS },
        ],
      });
      enqueueSuccessSnackBar({
        message: t`Provider "${provider?.label ?? providerName}" removed`,
      });
      navigate(AI_ADMIN_PATH);
    } catch {
      enqueueErrorSnackBar({
        message: t`Failed to remove provider`,
      });
    }
  };

  const handleRemoveModel = async () => {
    if (!providerName || !modelToRemove) {
      return;
    }

    try {
      await removeModelFromProvider({
        variables: {
          providerName,
          rawModelId: modelToRemove.rawModelId,
        },
        refetchQueries: [
          { query: GET_AI_PROVIDERS },
          { query: GET_ADMIN_AI_MODELS },
        ],
      });
      await refetchClientConfig();
      enqueueSuccessSnackBar({
        message: t`Model "${modelToRemove.label}" removed`,
      });
      setModelToRemove(null);
    } catch {
      enqueueErrorSnackBar({
        message: t`Failed to remove model`,
      });
    }
  };

  const provider = useMemo(() => {
    if (!providerName || !providersData?.getAiProviders) {
      return undefined;
    }

    const rawProviders = providersData.getAiProviders as Record<
      string,
      RawAiProviderConfig
    >;

    const config = rawProviders[providerName];

    if (!isDefined(config)) {
      return undefined;
    }

    return { name: providerName, ...config };
  }, [providerName, providersData]);

  const isCustomProvider = provider?.source === 'custom';

  const providerModels = useMemo(() => {
    const allModels = modelsData?.getAdminAiModels?.models ?? [];

    return allModels.filter((model) => model.providerName === providerName);
  }, [modelsData, providerName]);

  const filteredModels =
    searchQuery.trim().length === 0
      ? providerModels
      : providerModels.filter((model) => {
          const query = searchQuery.toLowerCase();

          return (
            model.label.toLowerCase().includes(query) ||
            model.modelId.toLowerCase().includes(query)
          );
        });

  const handleModelToggle = async (
    modelId: string,
    isCurrentlyEnabled: boolean,
  ) => {
    try {
      await setModelEnabled({
        variables: { modelId, enabled: !isCurrentlyEnabled },
        refetchQueries: [{ query: GET_ADMIN_AI_MODELS }],
      });
      await refetchClientConfig();
    } catch {
      enqueueErrorSnackBar({
        message: t`Failed to update model availability`,
      });
    }
  };

  const handleModelRemoveClick = (model: AdminAiModelConfig) => {
    const rawModelId = model.modelId.includes('/')
      ? model.modelId.split('/').slice(1).join('/')
      : model.modelId;

    setModelToRemove({
      modelId: model.modelId,
      label: model.label,
      rawModelId,
    });
    openModal(REMOVE_MODEL_MODAL_ID);
  };

  const providerInfoItems = useMemo(() => {
    if (!provider) {
      return [];
    }

    const items: Array<{
      Icon: IconComponent;
      label: string;
      value: string | React.ReactNode;
    }> = [
      {
        Icon: IconTag,
        label: t`Name`,
        value: provider.label ?? provider.name,
      },
      {
        Icon: IconPlug,
        label: t`SDK Package`,
        value: provider.npm,
      },
    ];

    if (provider.apiKeyConfigVariable) {
      const envVar = provider.apiKeyConfigVariable;
      const configPath = getSettingsPath(
        SettingsPath.AdminPanelConfigVariableDetails,
        { variableName: envVar },
      );

      items.push({
        Icon: IconKey,
        label: t`API Key`,
        value: (
          <RoundedLink
            href={configPath}
            label={provider.apiKey ?? t`Configure`}
            onClick={(event) => {
              event.preventDefault();
              navigate(configPath);
            }}
          />
        ),
      });
    } else if (provider.apiKey) {
      items.push({
        Icon: IconKey,
        label: t`API Key`,
        value: provider.apiKey,
      });
    }

    if (provider.baseUrl) {
      items.push({
        Icon: IconWorld,
        label: t`Base URL`,
        value: provider.baseUrl,
      });
    }

    if (provider.region) {
      items.push({
        Icon: IconServer,
        label: t`Region`,
        value: provider.region,
      });
    }

    if (provider.hasAccessKey) {
      items.push({
        Icon: IconKey,
        label: t`Credentials`,
        value: t`IAM credentials configured`,
      });
    }

    if (isCustomProvider && provider.dataResidency) {
      items.push({
        Icon: IconFlag,
        label: t`Data Residency`,
        value: getDataResidencyDisplay(provider.dataResidency),
      });
    }

    return items;
  }, [provider, navigate, isCustomProvider]);

  const newModelPath = providerName
    ? getSettingsPath(SettingsPath.AdminPanelNewAiModel, { providerName })
    : undefined;

  return (
    <SubMenuTopBarContainer
      links={[
        {
          children: t`Other`,
          href: getSettingsPath(SettingsPath.AdminPanel),
        },
        {
          children: t`Admin Panel`,
          href: getSettingsPath(SettingsPath.AdminPanel),
        },
        {
          children: t`AI`,
          href: AI_ADMIN_PATH,
        },
        {
          children: provider?.label ?? providerName ?? '',
        },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title={provider?.label ?? providerName ?? ''}
            description={provider ? provider.npm : t`Loading...`}
          />

          {provider && (
            <SettingsAdminTableCard
              rounded
              items={providerInfoItems}
              gridAutoColumns="120px 1fr"
            />
          )}
        </Section>

        <Section>
          <H2Title
            title={t`Models`}
            description={
              isCustomProvider
                ? t`Models for this provider. Toggle to enable or disable.`
                : t`Built-in models from this provider. Toggle to enable or disable.`
            }
          />

          {providerModels.length > 3 && (
            <SearchInput
              placeholder={t`Search a model...`}
              value={searchQuery}
              onChange={setSearchQuery}
            />
          )}

          {filteredModels.length > 0 && (
            <SettingsAdminAiModelsTable
              models={filteredModels}
              onToggle={handleModelToggle}
              checkedField="isAdminEnabled"
              anchorPrefix="provider-model-row"
              showDisabledState
              onRemove={isCustomProvider ? handleModelRemoveClick : undefined}
            />
          )}

          {isCustomProvider && newModelPath && (
            <UndecoratedLink to={newModelPath}>
              <Button
                Icon={IconPlus}
                title={t`Add Model`}
                variant="secondary"
              />
            </UndecoratedLink>
          )}
        </Section>

        {isCustomProvider && (
          <Section>
            <H2Title
              title={t`Danger zone`}
              description={t`Remove this provider and disconnect all its models`}
            />
            <Button
              Icon={IconTrash}
              title={t`Remove provider`}
              variant="secondary"
              accent="danger"
              onClick={() => openModal(REMOVE_PROVIDER_MODAL_ID)}
            />
          </Section>
        )}
      </SettingsPageContainer>

      <ConfirmationModal
        modalInstanceId={REMOVE_PROVIDER_MODAL_ID}
        title={t`Remove provider "${provider?.label ?? providerName}"`}
        subtitle={t`This will disconnect all models from this provider. Models will no longer be available until a new provider is configured.`}
        onConfirmClick={handleRemoveProvider}
        confirmButtonText={t`Remove`}
        confirmButtonAccent="danger"
      />

      <ConfirmationModal
        modalInstanceId={REMOVE_MODEL_MODAL_ID}
        title={t`Remove model "${modelToRemove?.label ?? ''}"`}
        subtitle={t`This model will be removed from the provider. You can re-add it later.`}
        onConfirmClick={handleRemoveModel}
        confirmButtonText={t`Remove`}
        confirmButtonAccent="danger"
      />
    </SubMenuTopBarContainer>
  );
};
