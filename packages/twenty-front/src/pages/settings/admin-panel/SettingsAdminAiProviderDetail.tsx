import { useContext, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useMutation, useQuery } from '@apollo/client/react';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import {
  AppTooltip,
  H2Title,
  IconKey,
  IconPlug,
  IconRefresh,
  IconServer,
  IconTag,
  IconTrash,
  IconWorld,
  TooltipDelay,
} from 'twenty-ui/display';
import { Button, Checkbox, SearchInput } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { useClientConfig } from '@/client-config/hooks/useClientConfig';
import { SettingsAdminAiModelHoverCard } from '@/settings/admin-panel/ai/components/SettingsAdminAiModelHoverCard';
import { REMOVE_AI_PROVIDER } from '@/settings/admin-panel/ai/graphql/mutations/removeAiProvider';
import { GET_ADMIN_AI_MODELS } from '@/settings/admin-panel/ai/graphql/queries/getAdminAiModels';
import { GET_AI_PROVIDERS } from '@/settings/admin-panel/ai/graphql/queries/getAiProviders';
import { getProviderTypeLabel } from '@/settings/admin-panel/ai/utils/getProviderIcon';
import { SettingsAdminTableCard } from '@/settings/admin-panel/components/SettingsAdminTableCard';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import {
  DiscoverAiModelsDocument,
  SetAdminAiModelEnabledDocument,
} from '~/generated-metadata/graphql';
import { getModelIcon } from '~/pages/settings/ai/utils/getModelIcon';
import { getModelProviderLabel } from '~/pages/settings/ai/utils/getModelProviderLabel';

const GRID_TEMPLATE_COLUMNS = '1fr 120px 40px';

const StyledModelNameCell = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  overflow: hidden;
`;

const StyledModelLabel = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledDeprecatedSuffix = styled.span`
  color: ${themeCssVariables.font.color.light};
`;

const modelHoverCardTooltipClass = css`
  background-color: transparent !important;
  border: none !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  padding: 0 !important;
`;

const REMOVE_MODAL_ID = 'settings-ai-provider-remove';

export const SettingsAdminAiProviderDetail = () => {
  const { providerName } = useParams<{ providerName: string }>();
  const navigate = useNavigate();
  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();
  const { refetch: refetchClientConfig } = useClientConfig();
  const { openModal } = useModal();
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredModelId, setHoveredModelId] = useState<string | null>(null);

  const { data: providersData } = useQuery<{
    getAiProviders: Record<string, unknown>;
  }>(GET_AI_PROVIDERS);

  const { data: modelsData } = useQuery<{
    getAdminAiModels: {
      models: Array<{
        modelId: string;
        label: string;
        modelFamily?: string | null;
        provider: string;
        isAvailable: boolean;
        isAdminEnabled: boolean;
        deprecated?: boolean | null;
        isRecommended?: boolean | null;
        contextWindowTokens?: number | null;
        maxOutputTokens?: number | null;
        inputCostPerMillionTokens?: number | null;
        outputCostPerMillionTokens?: number | null;
        providerName?: string | null;
      }>;
    };
  }>(GET_ADMIN_AI_MODELS);

  const [setModelEnabled] = useMutation(SetAdminAiModelEnabledDocument);
  const [discoverModels, { loading: isDiscovering }] = useMutation(
    DiscoverAiModelsDocument,
  );
  const [removeAiProvider] = useMutation(REMOVE_AI_PROVIDER);

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
        message: t`Provider "${providerName}" removed`,
      });
      navigate(
        getSettingsPath(SettingsPath.AdminPanel, undefined, undefined, 'ai'),
      );
    } catch {
      enqueueErrorSnackBar({
        message: t`Failed to remove provider`,
      });
    }
  };

  const provider = useMemo(() => {
    if (!providerName || !providersData?.getAiProviders) {
      return undefined;
    }

    const rawProviders = providersData.getAiProviders as Record<
      string,
      {
        type: string;
        baseUrl?: string;
        region?: string;
        apiKey?: string;
        hasAccessKey?: boolean;
      }
    >;

    const config = rawProviders[providerName];

    if (config === undefined) {
      return undefined;
    }

    return { name: providerName, ...config };
  }, [providerName, providersData]);

  const providerModels = useMemo(() => {
    const allModels = modelsData?.getAdminAiModels?.models ?? [];

    return allModels.filter((model) => model.providerName === providerName);
  }, [modelsData, providerName]);

  const filteredModels = useMemo(() => {
    if (searchQuery.trim().length === 0) {
      return providerModels;
    }

    const query = searchQuery.toLowerCase();

    return providerModels.filter(
      (model) =>
        model.label.toLowerCase().includes(query) ||
        model.modelId.toLowerCase().includes(query),
    );
  }, [providerModels, searchQuery]);

  const hoveredModel = useMemo(
    () => filteredModels.find((model) => model.modelId === hoveredModelId),
    [filteredModels, hoveredModelId],
  );

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

  const handleDiscoverModels = async () => {
    try {
      const result = await discoverModels({
        refetchQueries: [{ query: GET_ADMIN_AI_MODELS }],
      });
      await refetchClientConfig();
      const count = result.data?.discoverAiModels ?? 0;

      if (count > 0) {
        enqueueSuccessSnackBar({
          message: t`Discovered ${count} new models`,
        });
      } else {
        enqueueSuccessSnackBar({
          message: t`No new models found. All available models are already registered.`,
        });
      }
    } catch (error) {
      enqueueErrorSnackBar({
        message: t`Model discovery failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  };

  const providerInfoItems = useMemo(() => {
    if (!provider) {
      return [];
    }

    const items = [
      { Icon: IconTag, label: t`Name`, value: provider.name },
      {
        Icon: IconPlug,
        label: t`Type`,
        value: getProviderTypeLabel(provider.type),
      },
    ];

    if (provider.apiKey) {
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

    return items;
  }, [provider]);

  const { theme } = useContext(ThemeContext);

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
          href: getSettingsPath(
            SettingsPath.AdminPanel,
            undefined,
            undefined,
            'ai',
          ),
        },
        {
          children: providerName ?? '',
        },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title={providerName ?? ''}
            description={
              provider ? getProviderTypeLabel(provider.type) : t`Loading...`
            }
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
            description={t`Models available from this provider. Toggle to enable or disable.`}
          />

          {providerModels.length > 3 && (
            <SearchInput
              placeholder={t`Search a model...`}
              value={searchQuery}
              onChange={setSearchQuery}
            />
          )}

          {filteredModels.length === 0 ? (
            <Button
              Icon={isDiscovering ? undefined : IconRefresh}
              title={isDiscovering ? t`Discovering...` : t`Discover Models`}
              variant="secondary"
              onClick={handleDiscoverModels}
              disabled={isDiscovering}
            />
          ) : (
            <>
              <Table>
                <TableRow gridTemplateColumns={GRID_TEMPLATE_COLUMNS}>
                  <TableHeader>
                    <Trans>Name</Trans>
                  </TableHeader>
                  <TableHeader align="right">
                    <Trans>Provider</Trans>
                  </TableHeader>
                  <TableHeader />
                </TableRow>
                <TableBody>
                  {filteredModels.map((model) => {
                    const ModelIcon = getModelIcon(model.modelFamily);
                    const providerLabel = getModelProviderLabel(
                      model.modelFamily,
                    );
                    const isDisabled =
                      !model.isAvailable || model.deprecated === true;
                    const safeId = model.modelId.replace(
                      /[^a-zA-Z0-9-_]/g,
                      '_',
                    );

                    return (
                      <div
                        key={model.modelId}
                        id={`provider-model-row-${safeId}`}
                        onMouseEnter={() => setHoveredModelId(model.modelId)}
                        onMouseLeave={() => setHoveredModelId(null)}
                      >
                        <TableRow
                          gridTemplateColumns={GRID_TEMPLATE_COLUMNS}
                          onClick={
                            isDisabled
                              ? undefined
                              : () =>
                                  handleModelToggle(
                                    model.modelId,
                                    model.isAdminEnabled,
                                  )
                          }
                        >
                          <TableCell
                            color={
                              isDisabled
                                ? themeCssVariables.font.color.light
                                : themeCssVariables.font.color.primary
                            }
                          >
                            <StyledModelNameCell>
                              <ModelIcon
                                size={theme.icon.size.md}
                                stroke={theme.icon.stroke.sm}
                                color={
                                  isDisabled
                                    ? theme.font.color.light
                                    : theme.font.color.secondary
                                }
                              />
                              <StyledModelLabel>{model.label}</StyledModelLabel>
                              {model.deprecated === true && (
                                <StyledDeprecatedSuffix>
                                  · {t`Deprecated...`}
                                </StyledDeprecatedSuffix>
                              )}
                            </StyledModelNameCell>
                          </TableCell>
                          <TableCell
                            align="right"
                            color={themeCssVariables.font.color.tertiary}
                          >
                            {providerLabel}
                          </TableCell>
                          <TableCell align="right">
                            <Checkbox
                              checked={model.isAdminEnabled}
                              disabled={isDisabled}
                              onChange={() => {
                                handleModelToggle(
                                  model.modelId,
                                  model.isAdminEnabled,
                                );
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      </div>
                    );
                  })}
                </TableBody>
              </Table>

              <Button
                Icon={isDiscovering ? undefined : IconRefresh}
                title={isDiscovering ? t`Discovering...` : t`Discover Models`}
                variant="secondary"
                onClick={handleDiscoverModels}
                disabled={isDiscovering}
              />
            </>
          )}

          {hoveredModel && (
            <AppTooltip
              anchorSelect={`#provider-model-row-${hoveredModel.modelId.replace(/[^a-zA-Z0-9-_]/g, '_')}`}
              place="left"
              noArrow
              offset={8}
              delay={TooltipDelay.noDelay}
              className={modelHoverCardTooltipClass}
              width="320px"
            >
              <SettingsAdminAiModelHoverCard
                label={hoveredModel.label}
                modelFamily={hoveredModel.modelFamily}
                contextWindowTokens={hoveredModel.contextWindowTokens}
                maxOutputTokens={hoveredModel.maxOutputTokens}
                inputCostPerMillionTokens={
                  hoveredModel.inputCostPerMillionTokens
                }
                outputCostPerMillionTokens={
                  hoveredModel.outputCostPerMillionTokens
                }
              />
            </AppTooltip>
          )}
        </Section>

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
            onClick={() => openModal(REMOVE_MODAL_ID)}
          />
        </Section>
      </SettingsPageContainer>

      <ConfirmationModal
        modalInstanceId={REMOVE_MODAL_ID}
        title={t`Remove provider "${providerName}"`}
        subtitle={t`This will disconnect all models from this provider. Models will no longer be available until a new provider is configured.`}
        onConfirmClick={handleRemoveProvider}
        confirmButtonText={t`Remove`}
        confirmButtonAccent="danger"
      />
    </SubMenuTopBarContainer>
  );
};
