import { useMemo, useState } from 'react';

import { useMutation, useQuery } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { AI_MODEL_TIERS, type AiModelTier } from 'twenty-shared/ai';
import { IconMessage } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { UndecoratedLink } from 'twenty-ui/navigation';
import { H2Title } from 'twenty-ui/typography';
import { Section } from 'twenty-ui/layout';
import { Card } from 'twenty-ui/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { billingState } from '@/client-config/states/billingState';
import { useClientConfig } from '@/client-config/hooks/useClientConfig';
import { getAiModelTierLabel } from '@/ai/utils/getAiModelTierLabel';
import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { SettingsAdminAiProviderListCard } from '@/settings/admin-panel/ai/components/SettingsAdminAiProviderListCard';
import { useCustomAiProviderAccess } from '@/settings/admin-panel/ai/hooks/useCustomAiProviderAccess';
import { AI_PROVIDER_SOURCE } from '@/settings/admin-panel/ai/constants/AiProviderSource';
import { SET_ADMIN_DEFAULT_AI_MODEL } from '@/settings/admin-panel/ai/graphql/mutations/setAdminDefaultAiModel';
import { GET_ADMIN_AI_MODELS } from '@/settings/admin-panel/ai/graphql/queries/getAdminAiModels';
import { GET_ADMIN_AI_USAGE_BY_WORKSPACE } from '@/settings/admin-panel/ai/graphql/queries/getAdminAiUsageByWorkspace';
import { GET_AI_PROVIDERS } from '@/settings/admin-panel/ai/graphql/queries/getAiProviders';
import { type GetAiProvidersResult } from '@/settings/admin-panel/ai/types/GetAiProvidersResult';
import { parseProviderItems } from '@/settings/admin-panel/ai/utils/parseProviderItems';
import { getModelIcon } from '@/settings/ai/utils/getModelIcon';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { SettingsEnterpriseFeatureGateCard } from '@/settings/components/SettingsEnterpriseFeatureGateCard';
import { SettingsOptionCardContentSelect } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSelect';
import { useUsageValueFormatter } from '@/settings/usage/hooks/useUsageValueFormatter';
import { getPeriodDates } from '@/settings/usage/utils/getPeriodDates';
import { getPeriodOptions } from '@/settings/usage/utils/getPeriodOptions';
import { type PeriodPreset } from '@/settings/usage/utils/periodPreset';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { Select } from '@/ui/input/components/Select';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import {
  type AdminAiModelConfig,
  type AdminAiModelTierDefault,
  type AiModelTier as GraphqlAiModelTier,
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
  const { enqueueErrorSnackBar } = useSnackBar();
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

  const enabledModels = models.filter(
    (model) => model.isAvailable && model.isAdminEnabled && !model.isDeprecated,
  );

  const availableModelOptions = enabledModels.map((model) => ({
    value: model.modelId,
    label: model.label,
    Icon: getModelIcon(model.modelFamily, model.providerName),
  }));

  const handleDefaultModelChange = async (
    tier: AiModelTier,
    modelId: string,
  ) => {
    try {
      await setDefaultModel({
        variables: { tier: tier as GraphqlAiModelTier, modelId },
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
      </Section>

      {availableModelOptions.length > 0 && (
        <Section>
          <H2Title
            title={t`Default Models`}
            description={t`The model behind each tier for every workspace. Workspaces can pin their own.`}
          />

          <Card rounded>
            {AI_MODEL_TIERS.map((tier, index) => (
              <SettingsOptionCardContentSelect
                key={tier}
                title={getAiModelTierLabel(tier)}
                divider={index < AI_MODEL_TIERS.length - 1}
              >
                <Select
                  dropdownId={`admin-default-model-select-${tier}`}
                  value={
                    defaultModelByTier.find(
                      (defaultModel) => defaultModel.tier === tier,
                    )?.modelId ?? undefined
                  }
                  onChange={(value: string) =>
                    handleDefaultModelChange(tier, value)
                  }
                  options={availableModelOptions}
                  withSearchInput
                  selectSizeVariant="small"
                  dropdownWidth={GenericDropdownContentWidth.ExtraLarge}
                />
              </SettingsOptionCardContentSelect>
            ))}
          </Card>
        </Section>
      )}

      <Section>
        <H2Title
          title={t`Chats`}
          description={t`Browse AI chat threads across all workspaces, including onboarding chats`}
        />
        <UndecoratedLink to={getSettingsPath(SettingsPath.AdminPanelChats)}>
          <Button
            Icon={IconMessage}
            title={t`View all chats`}
            size="small"
            variant="secondary"
          />
        </UndecoratedLink>
      </Section>

      <Section>
        <H2Title
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
            title={t`Enterprise feature`}
            description={t`AI usage analytics across workspaces is available with an Enterprise key.`}
            buttonTitle={t`Activate`}
          />
        )}
      </Section>
    </>
  );
};
