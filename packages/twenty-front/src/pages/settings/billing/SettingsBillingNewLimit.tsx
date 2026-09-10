import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { Trans, useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';

import { SettingsBillingLimitForm } from '@/settings/billing/components/SettingsBillingLimitForm';
import { EMPTY_USAGE_LIMIT_FORM_VALUES } from '@/settings/billing/constants/EmptyUsageLimitFormValues';
import { useCreateUsageLimit } from '@/settings/billing/hooks/useCreateUsageLimit';
import { useUsageQuotaDefinitions } from '@/settings/billing/hooks/useUsageQuotaDefinitions';
import { useUsageQuotaScopeConsumption } from '@/settings/billing/hooks/useUsageQuotaScopeConsumption';
import { type UsageLimitFormValues } from '@/settings/billing/types/UsageLimitFormValues';
import { buildCreateUsageLimitInput } from '@/settings/billing/utils/buildCreateUsageLimitInput';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { UsageSectionSkeleton } from '@/settings/usage/components/UsageSectionSkeleton';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const SettingsBillingNewLimit = () => {
  const { t } = useLingui();
  const navigate = useNavigateSettings();
  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();
  const { usageQuotaDefinitions, loading: definitionsLoading } =
    useUsageQuotaDefinitions();
  const { createUsageLimit, loading: isSaving } = useCreateUsageLimit();

  const [values, setValues] = useState<UsageLimitFormValues>(
    EMPTY_USAGE_LIMIT_FORM_VALUES,
  );

  const input = buildCreateUsageLimitInput(values);
  const { scopeConsumption } = useUsageQuotaScopeConsumption(input);

  const handleSave = async () => {
    if (!isDefined(input)) {
      return;
    }

    try {
      await createUsageLimit({ variables: { input } });
      enqueueSuccessSnackBar({ message: t`Limit created.` });
      navigate(SettingsPath.BillingLimits);
    } catch (error) {
      const serverMessage =
        error instanceof CombinedGraphQLErrors
          ? error.errors[0]?.message
          : undefined;

      enqueueErrorSnackBar({
        message: serverMessage ?? t`Failed to create the limit.`,
      });
    }
  };

  return (
    <SettingsPageLayout
      title={t`New limit`}
      links={[
        {
          children: <Trans>Workspace</Trans>,
          href: getSettingsPath(SettingsPath.General),
        },
        {
          children: <Trans>Billing</Trans>,
          href: getSettingsPath(SettingsPath.Billing),
        },
        {
          children: <Trans>Limits</Trans>,
          href: getSettingsPath(SettingsPath.BillingLimits),
        },
        { children: <Trans>New limit</Trans> },
      ]}
      actionButton={
        <SaveAndCancelButtons
          onSave={handleSave}
          onCancel={() => navigate(SettingsPath.BillingLimits)}
          isSaveDisabled={!isDefined(input)}
          isLoading={isSaving}
        />
      }
    >
      <SettingsPageContainer>
        {definitionsLoading || !isDefined(usageQuotaDefinitions) ? (
          <UsageSectionSkeleton />
        ) : (
          <SettingsBillingLimitForm
            definitions={usageQuotaDefinitions}
            values={values}
            scopeConsumption={scopeConsumption}
            onChange={setValues}
          />
        )}
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
