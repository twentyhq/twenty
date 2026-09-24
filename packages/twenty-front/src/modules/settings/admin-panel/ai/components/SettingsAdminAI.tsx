import { NavigationButton } from '@/ui/input/components/NavigationButton';
import { useMemo, useState } from 'react';
import { Section, useToast } from 'twenty-ui/components';

import { useMutation, useQuery } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { AI_MODEL_TIERS, type AiModelTier } from 'twenty-shared/ai';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { IconMessage } from 'twenty-ui/icon';
import { Card } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';

import { getAiModelTierLabel } from '@/ai/utils/getAiModelTierLabel';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useClientConfig } from '@/client-config/hooks/useClientConfig';
import { billingState } from '@/client-config/states/billingState';
import { SettingsAdminAiProviderListCard } from '@/settings/admin-panel/ai/components/SettingsAdminAiProviderListCard';
import { AI_PROVIDER_SOURCE } from '@/settings/admin-panel/ai/constants/AiProviderSource';
import { SET_ADMIN_DEFAULT_AI_MODEL } from '@/settings/admin-panel/ai/graphql/mutations/setAdminDefaultAiModel';
import { GET_ADMIN_AI_MODELS } from '@/settings/admin-panel/ai/graphql/queries/getAdminAiModels';
import { GET_ADMIN_AI_USAGE_BY_WORKSPACE } from '@/settings/admin-panel/ai/graphql/queries/getAdminAiUsageByWorkspace';
import { GET_AI_PROVIDERS } from '@/settings/admin-panel/ai/graphql/queries/getAiProviders';
import { useCustomAiProviderAccess } from '@/settings/admin-panel/ai/hooks/useCustomAiProviderAccess';
import { type GetAiProvidersResult } from '@/settings/admin-panel/ai/types/GetAiProvidersResult';
import { parseProviderItems } from '@/settings/admin-panel/ai/utils/parseProviderItems';
import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { AiModelPinSelect } from '@/settings/ai/components/AiModelPinSelect';
import { SettingsEnterpriseFeatureGateCard } from '@/settings/components/SettingsEnterpriseFeatureGateCard';
import { SettingsOptionCardContentSelect } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSelect';
import { StyledSettingsSelectGroup } from '@/settings/components/SettingsOptions/StyledSettingsSelectGroup';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { useUsageValueFormatter } from '@/settings/usage/hooks/useUsageValueFormatter';
import { getPeriodDates } from '@/settings/usage/utils/getPeriodDates';
import { getPeriodOptions } from '@/settings/usage/utils/getPeriodOptions';
import { type PeriodPreset } from '@/settings/usage/utils/periodPreset';
import { Select } from '@/ui/input/components/Select';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import {
  type AdminAiModelConfig,
  type AdminAiModelTierDefault,
  AiModelTier as GraphqlAiModelTier,
} from '~/generated-admin/graphql';
import { OrganizationAdornment } from '~/pages/settings/enterprise/components/OrganizationAdornment';

const USAGE_TABLE_GRID_TEMPLATE_COLUMNS = '1fr 120px';

type UsageBreakdownItem = {
  key: string;
  label?: string | null;
  creditsUsed: number;
};

export const SettingsAdminAI = () => {
  const apolloAdminClient = useApolloAdminClient();
  const { enqueueToast } = useToast();
  const { refetch: refetchClientConfig } = useClientConfig();
  const { formatUsageValue } = useUsageValueFormatter();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const billing = useAtomStateValue(billingState);
  const isBillingEnabled = billing?.isBillingEnabled ?? false;
  const hasEnterpriseAccess =
    isBillingEnabled ||
    currentWorkspace?.hasValidEnterpriseValidityToken === true;
  const {
    hasAccess: hasCustomAiProviderAccess,
    gateDescription: customAiProviderGateDescription,
    tooltipContent: customAiProviderTooltipContent,
  } = useCustomAiProviderAccess();
  const [usagePeriod, setUsagePeriod] = useState<PeriodPreset>('30d');
  const periodOptions = getPeriodOptions();
  const usageDates = getPeriodDates(usagePeriod);

  const { data, loading: isLoadingModels } = useQuery<{
    getAdminAiModels: {
      defaultModelByTier: AdminAiModelTierDefault[];
      models: AdminAiModelConfig[];
    };
  }>(GET_ADMIN_AI_MODELS, { client: apolloAdminClient });

  const [setDefaultModel] = useMutation(SET_ADMIN_DEFAULT_AI_MODEL, {
    client: apolloAdminClient,
  });

  const { data: providersData, loading: isLoadingProviders } =
    useQuery<GetAiProvidersResult>(GET_AI_PROVIDERS, {
      client: apolloAdminClient,
    });

  const { data: usageData, previousData: previousUsageData } = useQuery<{
    getAdminAiUsageByWorkspace: UsageBreakdownItem[];
  }>(GET_ADMIN_AI_USAGE_BY_WORKSPACE, {
    client: apolloAdminClient,
    variables: {
      periodStart: usageDates.periodStart,
      periodEnd: usageDates.periodEnd,
    },
    skip: !hasEnterpriseAccess,
  });

  const effectiveUsageData = usageData ?? previousUsageData;
  const usageByWorkspace = effectiveUsageData?.getAdminAiUsageByWorkspace ?? [];

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
    return <SettingsSectionSkeletonLoader />;
  }

  const defaultModelByTier = data?.getAdminAiModels?.defaultModelByTier ?? [];

  // A tier default names the model that answers chats and agent runs, so only a
  // language model can fill one: an evaluation model here is refused server-side.
  const enabledModels = models.filter(
    (model) =>
      model.kind === 'language' &&
      model.isAvailable &&
      model.isAdminEnabled &&
      !model.isDeprecated,
  );

  const handleDefaultModelChange = async (
    tier: AiModelTier,
    modelId: string,
  ) => {
    try {
      await setDefaultModel({
        variables: { tier: GraphqlAiModelTier[tier], modelId },
        refetchQueries: [{ query: GET_ADMIN_AI_MODELS }],
      });
      await refetchClientConfig();
    } catch {
      enqueueToast({
        variant: 'error',
        children: t`Failed to update default model`,
      });
    }
  };

  return (
    <>
      <Section.Root>
        <Section.Header
          title={t`Providers`}
          description={t`Built-in providers activated by API key. Click to manage models.`}
        />

        <SettingsAdminAiProviderListCard
          providers={catalogProviders}
          showAddButton={false}
        />
      </Section.Root>

      <Section.Root>
        <Section.Header
          title={t`Custom Providers`}
          description={t`Add custom endpoints, private gateways, or additional regions.`}
          adornment={
            <OrganizationAdornment
              tooltipContent={customAiProviderTooltipContent}
            />
          }
        />

        <SettingsAdminAiProviderListCard
          providers={customProviders}
          showAddButton={hasCustomAiProviderAccess}
        />

        {!hasCustomAiProviderAccess && (
          <SettingsEnterpriseFeatureGateCard
            title={t`Organization feature`}
            description={customAiProviderGateDescription}
            buttonTitle={t`Activate`}
          />
        )}
      </Section.Root>

      {enabledModels.length > 0 && (
        <Section.Root>
          <Section.Header
            title={t`Default Models`}
            description={t`The model behind each mode for every workspace. Workspaces can pin their own.`}
          />

          <Card rounded>
            <StyledSettingsSelectGroup controlWidth={260}>
              {AI_MODEL_TIERS.map((tier, index) => (
                <SettingsOptionCardContentSelect
                  key={tier}
                  title={getAiModelTierLabel(tier)}
                  divider={index < AI_MODEL_TIERS.length - 1}
                >
                  <AiModelPinSelect
                    dropdownId={`admin-default-model-select-${tier}`}
                    modelId={
                      defaultModelByTier.find(
                        (defaultModel) => defaultModel.tier === tier,
                      )?.modelId ?? null
                    }
                    onChange={(modelId) => {
                      if (isDefined(modelId)) {
                        void handleDefaultModelChange(tier, modelId);
                      }
                    }}
                    aiModels={enabledModels}
                    selectSizeVariant="small"
                    dropdownWidth={GenericDropdownContentWidth.ExtraLarge}
                  />
                </SettingsOptionCardContentSelect>
              ))}
            </StyledSettingsSelectGroup>
          </Card>
        </Section.Root>
      )}

      <Section.Root>
        <Section.Header
          title={t`Chats`}
          description={t`Browse AI chat threads across all workspaces, including onboarding chats`}
        />
        <NavigationButton
          to={getSettingsPath(SettingsPath.AdminPanelChats)}
          startIcon={<IconMessage />}
          size="sm"
          variant="outline"
        >{t`View all chats`}</NavigationButton>
      </Section.Root>

      <Section.Root>
        <Section.Header
          title={t`AI Usage by Workspace`}
          description={t`AI consumption across all workspaces.`}
          adornment={
            hasEnterpriseAccess ? (
              <Select
                dropdownId="admin-ai-usage-period"
                value={usagePeriod}
                options={periodOptions}
                onChange={setUsagePeriod}
                needIconCheck
                selectSizeVariant="small"
              />
            ) : (
              <OrganizationAdornment />
            )
          }
        />
        {hasEnterpriseAccess ? (
          usageByWorkspace.length > 0 ? (
            <Table>
              <TableRow gridTemplateColumns={USAGE_TABLE_GRID_TEMPLATE_COLUMNS}>
                <TableHeader>{t`Workspace`}</TableHeader>
                <TableHeader align="right">{t`Usage`}</TableHeader>
              </TableRow>
              {usageByWorkspace.map((item) => (
                <TableRow
                  key={item.key}
                  gridTemplateColumns={USAGE_TABLE_GRID_TEMPLATE_COLUMNS}
                  to={getSettingsPath(SettingsPath.AdminPanelWorkspaceDetail, {
                    workspaceId: item.key,
                  })}
                >
                  <TableCell color={themeCssVariables.font.color.primary}>
                    {item.label ?? item.key}
                  </TableCell>
                  <TableCell align="right">
                    {formatUsageValue(item.creditsUsed)}
                  </TableCell>
                </TableRow>
              ))}
            </Table>
          ) : (
            <Card rounded>
              <TableRow gridTemplateColumns="1fr">
                <TableCell
                  color={themeCssVariables.font.color.tertiary}
                  align="center"
                >
                  {t`No AI usage data recorded yet.`}
                </TableCell>
              </TableRow>
            </Card>
          )
        ) : (
          <SettingsEnterpriseFeatureGateCard
            title={t`Organization feature`}
            description={t`AI usage analytics across workspaces is available with an Organization key.`}
            buttonTitle={t`Activate`}
          />
        )}
      </Section.Root>
    </>
  );
};
