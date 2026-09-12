import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { Trans, useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { IconTrash } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { H2Title } from 'twenty-ui/typography';

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
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
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
  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();
  const { usageQuotaDefinitions, loading: definitionsLoading } =
    useUsageQuotaDefinitions();
  const { updateUsageLimit, loading: isSaving } = useUpdateUsageLimit();
  const { deleteUsageLimit, loading: isDeleting } = useDeleteUsageLimit();
  const { openModal, closeModal } = useModal();

  const [values, setValues] = useState<UsageLimitFormValues>(
    buildUsageLimitFormValues(quota),
  );

  const input = buildCreateUsageLimitInput(values);
  const { scopeConsumption } = useUsageQuotaScopeConsumption(values);

  const handleDelete = async () => {
    try {
      await deleteUsageLimit({ variables: { usageLimitId } });
      enqueueSuccessSnackBar({ message: t`Limit deleted.` });
      navigate(SettingsPath.BillingLimits);
    } catch {
      enqueueErrorSnackBar({ message: t`Failed to delete the limit.` });
    } finally {
      closeModal(DELETE_MODAL_ID);
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

      enqueueSuccessSnackBar({ message: t`Limit updated.` });
      navigate(SettingsPath.BillingLimits);
    } catch (error) {
      const serverMessage =
        error instanceof CombinedGraphQLErrors
          ? error.errors[0]?.message
          : undefined;

      enqueueErrorSnackBar({
        message: serverMessage ?? t`Failed to update the limit.`,
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
            <Section>
              <H2Title
                title={t`Danger zone`}
                description={t`Spending stays capped by your plan allowance and the other limits.`}
              />
              <Button
                Icon={IconTrash}
                title={t`Delete limit`}
                variant="secondary"
                accent="danger"
                size="small"
                disabled={isDeleting}
                onClick={() => openModal(DELETE_MODAL_ID)}
              />
              <ConfirmationModal
                modalInstanceId={DELETE_MODAL_ID}
                title={t`Delete this limit?`}
                subtitle={t`Spending will only be capped by your plan allowance and the other limits.`}
                confirmButtonText={t`Delete`}
                loading={isDeleting}
                onConfirmClick={handleDelete}
              />
            </Section>
          </>
        )}
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
