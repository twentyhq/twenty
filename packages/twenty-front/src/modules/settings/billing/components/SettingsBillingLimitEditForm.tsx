import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { Trans, useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { Section, useToast } from 'twenty-ui/components';
import { IconTrash } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';

import { SettingsBillingLimitForm } from '@/settings/billing/components/SettingsBillingLimitForm';
import { useDeleteUsageLimit } from '@/settings/billing/hooks/useDeleteUsageLimit';
import { useUpdateUsageLimit } from '@/settings/billing/hooks/useUpdateUsageLimit';
import { useUsageQuotaDefinitions } from '@/settings/billing/hooks/useUsageQuotaDefinitions';
import { useUsageQuotaScopeConsumption } from '@/settings/billing/hooks/useUsageQuotaScopeConsumption';
import { type UsageLimitFormValues } from '@/settings/billing/types/UsageLimitFormValues';
import { type UsageQuotaWithConsumption } from '@/settings/billing/types/UsageQuotaWithConsumption';
import { buildCreateUsageLimitInput } from '@/settings/billing/utils/buildCreateUsageLimitInput';
import { buildUsageLimitFormValues } from '@/settings/billing/utils/buildUsageLimitFormValues';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { ConfirmationDialog } from '@/ui/layout/dialog/components/ConfirmationDialog';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const DELETE_MODAL_ID = 'usage-limit-edit-delete';

type SettingsBillingLimitEditFormProps = {
  usageLimitId: string;
  quota: UsageQuotaWithConsumption;
};

export const SettingsBillingLimitEditForm = ({
  usageLimitId,
  quota,
}: SettingsBillingLimitEditFormProps) => {
  const { t } = useLingui();
  const navigate = useNavigateSettings();
  const { enqueueToast } = useToast();
  const { usageQuotaDefinitions, loading: definitionsLoading } =
    useUsageQuotaDefinitions();
  const { updateUsageLimit, loading: isSaving } = useUpdateUsageLimit();
  const { deleteUsageLimit, loading: isDeleting } = useDeleteUsageLimit();
  const { openDialog, closeDialog } = useDialog();

  const [values, setValues] = useState<UsageLimitFormValues>(
    buildUsageLimitFormValues(quota),
  );

  const input = buildCreateUsageLimitInput(values);
  const { scopeConsumption } = useUsageQuotaScopeConsumption(values);

  const handleDelete = async () => {
    try {
      await deleteUsageLimit({ variables: { usageLimitId } });
      enqueueToast({ variant: 'success', children: t`Limit deleted.` });
      navigate(SettingsPath.BillingLimits);
    } catch {
      enqueueToast({
        variant: 'error',
        children: t`Failed to delete the limit.`,
      });
    } finally {
      closeDialog(DELETE_MODAL_ID);
    }
  };

  const handleSave = async () => {
    if (!isDefined(input)) {
      return;
    }

    try {
      await updateUsageLimit({
        variables: { input: { id: usageLimitId, payload: input } },
      });

      enqueueToast({ variant: 'success', children: t`Limit updated.` });
      navigate(SettingsPath.BillingLimits);
    } catch (error) {
      const serverMessage =
        error instanceof CombinedGraphQLErrors
          ? error.errors[0]?.message
          : undefined;

      enqueueToast({
        variant: 'error',
        children: serverMessage ?? t`Failed to update the limit.`,
      });
    }
  };

  return (
    <SettingsPageLayout
      title={t`Edit limit`}
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
        { children: <Trans>Edit limit</Trans> },
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
        {definitionsLoading || !isDefined(usageQuotaDefinitions) ? null : (
          <>
            <SettingsBillingLimitForm
              definitions={usageQuotaDefinitions}
              values={values}
              scopeConsumption={scopeConsumption}
              onChange={setValues}
            />
            <Section.Root>
              <Section.Header
                title={t`Danger zone`}
                description={t`Spending stays capped by your plan allowance and the other limits.`}
              />
              <Button
                startIcon={<IconTrash />}
                size="sm"
                disabled={isDeleting}
                onClick={() => openDialog(DELETE_MODAL_ID)}
                variant="outline"
                color="danger"
              >{t`Delete limit`}</Button>
              <ConfirmationDialog
                dialogId={DELETE_MODAL_ID}
                title={t`Delete this limit?`}
                subtitle={t`Spending will only be capped by your plan allowance and the other limits.`}
                confirmButtonText={t`Delete`}
                loading={isDeleting}
                onConfirmClick={handleDelete}
              />
            </Section.Root>
          </>
        )}
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
