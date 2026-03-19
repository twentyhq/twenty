import { useContext, useMemo, useState } from 'react';

import { useMutation, useQuery } from '@apollo/client/react';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import {
  AppTooltip,
  H2Title,
  IconBolt,
  IconRobot,
  TooltipDelay,
} from 'twenty-ui/display';
import { Checkbox } from 'twenty-ui/input';
import { Card, Section } from 'twenty-ui/layout';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { useClientConfig } from '@/client-config/hooks/useClientConfig';
import { billingState } from '@/client-config/states/billingState';
import { SettingsOptionCardContentSelect } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSelect';
import { Select } from '@/ui/input/components/Select';
import { SettingsAdminAiModelHoverCard } from '@/settings/admin-panel/ai/components/SettingsAdminAiModelHoverCard';
import { SettingsAdminAiProviderListCard } from '@/settings/admin-panel/ai/components/SettingsAdminAiProviderListCard';
import { GET_ADMIN_AI_MODELS } from '@/settings/admin-panel/ai/graphql/queries/getAdminAiModels';
import { GET_AI_PROVIDERS } from '@/settings/admin-panel/ai/graphql/queries/getAiProviders';
import { type AiProviderItem } from '@/settings/admin-panel/ai/types/AiProviderItem';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { SET_ADMIN_AI_MODEL_RECOMMENDED } from '@/settings/admin-panel/ai/graphql/mutations/setAdminAiModelRecommended';
import { SetAdminDefaultAiModelDocument } from '~/generated-metadata/graphql';
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

const modelHoverCardTooltipClass = css`
  background-color: transparent !important;
  border: none !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  padding: 0 !important;
`;

export const SettingsAdminAI = () => {
  const { enqueueErrorSnackBar } = useSnackBar();
  const billing = useAtomStateValue(billingState);
  const isBillingEnabled = billing?.isBillingEnabled ?? false;
  const { refetch: refetchClientConfig } = useClientConfig();
  const [hoveredModelId, setHoveredModelId] = useState<string | null>(null);

  const { data } = useQuery<{
    getAdminAiModels: {
      defaultSmartModelId?: string | null;
      defaultFastModelId?: string | null;
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

  const [setModelRecommended] = useMutation(SET_ADMIN_AI_MODEL_RECOMMENDED);
  const [setDefaultModel] = useMutation(SetAdminDefaultAiModelDocument);

  const { data: providersData, loading: isLoadingProviders } = useQuery<{
    getAiProviders: Record<string, unknown>;
  }>(GET_AI_PROVIDERS, { skip: isBillingEnabled });

  const models = useMemo(() => data?.getAdminAiModels?.models ?? [], [data]);

  const providerItems: AiProviderItem[] = useMemo(() => {
    const rawProviders = (providersData?.getAiProviders ?? {}) as Record<
      string,
      {
        type: string;
        baseUrl?: string;
        region?: string;
        apiKey?: string;
        hasAccessKey?: boolean;
      }
    >;

    return Object.entries(rawProviders).map(([name, config]) => ({
      id: name,
      name,
      ...config,
    }));
  }, [providersData]);

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

  const availableModelOptions = useMemo(
    () =>
      models
        .filter(
          (model) =>
            model.isAvailable &&
            model.isAdminEnabled &&
            model.deprecated !== true,
        )
        .map((model) => ({
          value: model.modelId,
          label: model.label,
          Icon: getModelIcon(model.modelFamily),
        })),
    [models],
  );

  const handleDefaultModelChange = async (
    role: 'smart' | 'fast',
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

  const enabledModels = useMemo(
    () =>
      models.filter(
        (model) =>
          model.isAvailable &&
          model.isAdminEnabled &&
          model.deprecated !== true,
      ),
    [models],
  );

  const hoveredModel = useMemo(
    () => enabledModels.find((model) => model.modelId === hoveredModelId),
    [enabledModels, hoveredModelId],
  );

  const { theme } = useContext(ThemeContext);

  return (
    <>
      {!isBillingEnabled && (
        <Section>
          <H2Title
            title={t`AI Providers`}
            description={t`Manage provider credentials. Click a provider to manage its models.`}
          />

          <SettingsAdminAiProviderListCard
            providers={providerItems}
            isLoading={isLoadingProviders}
          />
        </Section>
      )}

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
                  handleDefaultModelChange('smart', value)
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
                  handleDefaultModelChange('fast', value)
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
            description={t`Check models to make them available across all workspaces`}
          />

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
              {enabledModels.map((model) => {
                const ModelIcon = getModelIcon(model.modelFamily);
                const providerLabel = getModelProviderLabel(model.modelFamily);
                const safeId = model.modelId.replace(/[^a-zA-Z0-9-_]/g, '_');
                const isRecommended = model.isRecommended === true;

                return (
                  <div
                    key={model.modelId}
                    id={`recommended-model-row-${safeId}`}
                    onMouseEnter={() => setHoveredModelId(model.modelId)}
                    onMouseLeave={() => setHoveredModelId(null)}
                  >
                    <TableRow
                      gridTemplateColumns={GRID_TEMPLATE_COLUMNS}
                      onClick={() =>
                        handleRecommendedToggle(model.modelId, isRecommended)
                      }
                    >
                      <TableCell>
                        <StyledModelNameCell>
                          <ModelIcon
                            size={theme.icon.size.md}
                            stroke={theme.icon.stroke.sm}
                            color={theme.font.color.secondary}
                          />
                          <StyledModelLabel>{model.label}</StyledModelLabel>
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
                          checked={isRecommended}
                          onChange={() => {
                            handleRecommendedToggle(
                              model.modelId,
                              isRecommended,
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

          {hoveredModel && (
            <AppTooltip
              anchorSelect={`#recommended-model-row-${hoveredModel.modelId.replace(/[^a-zA-Z0-9-_]/g, '_')}`}
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
      )}
    </>
  );
};
