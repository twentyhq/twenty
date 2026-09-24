import { useMutation } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined, isNonEmptyString } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components';
import { useToast } from 'twenty-ui/primitives/feedback';
import { Button } from 'twenty-ui/primitives/input';
import { Dialog } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { CREATE_WORKSPACE_USAGE_LIMIT } from '@/settings/admin-panel/graphql/mutations/createWorkspaceUsageLimit';
import { DELETE_WORKSPACE_USAGE_LIMIT } from '@/settings/admin-panel/graphql/mutations/deleteWorkspaceUsageLimit';
import { UPDATE_WORKSPACE_USAGE_LIMIT } from '@/settings/admin-panel/graphql/mutations/updateWorkspaceUsageLimit';
import { WORKSPACE_USAGE_LIMITS } from '@/settings/admin-panel/graphql/queries/workspaceUsageLimits';
import { type AdminUsageLimitRow } from '@/settings/admin-panel/types/AdminUsageLimitRow';
import { formatUsageLimitValue } from '@/settings/admin-panel/utils/formatUsageLimitValue';
import { getAdminUsageLimitScopeLabel } from '@/settings/admin-panel/utils/getAdminUsageLimitScopeLabel';
import { USAGE_LIMIT_METER_LABELS } from '@/settings/billing/constants/UsageLimitMeterLabels';
import { getUsageLimitLabel } from '@/settings/billing/utils/getUsageLimitLabel';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { DialogInstance } from '@/ui/layout/dialog/components/DialogInstance';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';

type SettingsAdminWorkspaceUsageLimitModalProps = {
  dialogId: string;
  workspaceId: string;
  row: AdminUsageLimitRow;
};

const StyledSectionContainer = styled.div`
  margin-bottom: ${themeCssVariables.spacing[6]};
`;

const StyledFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledActions = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  margin-top: ${themeCssVariables.spacing[6]};
`;

const StyledActionSlot = styled.div`
  flex: 1;
`;

const parsePositiveInteger = (value: string): number | null => {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed >= 1 ? parsed : null;
};

export const SettingsAdminWorkspaceUsageLimitModal = ({
  dialogId,
  workspaceId,
  row,
}: SettingsAdminWorkspaceUsageLimitModalProps) => {
  const { t } = useLingui();
  const { closeDialog } = useDialog();
  const { enqueueToast } = useToast();
  const apolloAdminClient = useApolloAdminClient();

  const [limitValue, setLimitValue] = useState(String(row.limitValue));
  const [burstValue, setBurstValue] = useState(
    isDefined(row.burstValue) ? String(row.burstValue) : '',
  );

  const mutationOptions = {
    client: apolloAdminClient,
    refetchQueries: [
      { query: WORKSPACE_USAGE_LIMITS, variables: { workspaceId } },
    ],
  };

  const [createWorkspaceUsageLimit, { loading: isCreating }] = useMutation(
    CREATE_WORKSPACE_USAGE_LIMIT,
    mutationOptions,
  );
  const [updateWorkspaceUsageLimit, { loading: isUpdating }] = useMutation(
    UPDATE_WORKSPACE_USAGE_LIMIT,
    mutationOptions,
  );
  const [deleteWorkspaceUsageLimit, { loading: isResetting }] = useMutation(
    DELETE_WORKSPACE_USAGE_LIMIT,
    mutationOptions,
  );

  const parsedLimitValue = parsePositiveInteger(limitValue);
  const hasBurstValue = isNonEmptyString(burstValue.trim());
  const parsedBurstValue = hasBurstValue
    ? parsePositiveInteger(burstValue)
    : null;
  const isBurstAllowed = row.limitKind === 'speed';
  const isBusy = isCreating || isUpdating || isResetting;
  const isValid =
    isDefined(parsedLimitValue) &&
    (!isBurstAllowed || !hasBurstValue || isDefined(parsedBurstValue));

  const handleClose = () => {
    closeDialog(dialogId);
  };

  const handleSubmit = async () => {
    if (!isDefined(parsedLimitValue)) {
      return;
    }

    const payload = {
      resourceType: row.resourceType,
      operationType: row.operationType,
      spenderType: row.spenderType,
      spenderId: null,
      limitKind: row.limitKind,
      periodCount: row.periodCount,
      periodUnit: row.periodUnit,
      meter: row.meter,
      limitValue: parsedLimitValue,
      burstValue: isBurstAllowed ? parsedBurstValue : null,
    };

    try {
      if (isDefined(row.usageLimitId)) {
        await updateWorkspaceUsageLimit({
          variables: {
            workspaceId,
            payload: { id: row.usageLimitId, payload },
          },
        });
      } else {
        await createWorkspaceUsageLimit({
          variables: { workspaceId, payload },
        });
      }

      enqueueToast({
        variant: 'success',
        children: t`Limit saved for this workspace.`,
      });
      handleClose();
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
    }
  };

  const handleReset = async () => {
    if (!isDefined(row.usageLimitId)) {
      return;
    }

    try {
      await deleteWorkspaceUsageLimit({
        variables: { workspaceId, usageLimitId: row.usageLimitId },
      });

      enqueueToast({
        variant: 'success',
        children: t`Override removed. The instance default applies again.`,
      });
      handleClose();
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
    }
  };

  const meterLabel = getUsageLimitLabel(USAGE_LIMIT_METER_LABELS, row.meter);
  const scopeLabel = getAdminUsageLimitScopeLabel(row);
  const unenforcedNotice =
    row.isOverridden && !row.isOverrideEnforced
      ? t`This override is stored but the workspace's plan does not enforce it, so the instance default still caps this scope.`
      : null;
  const defaultText = formatUsageLimitValue({
    value: row.defaultValue,
    meter: row.meter,
  });
  // 'quantity' renders as the number already typed, so echoing it says nothing.
  const limitValueAdornment =
    isDefined(parsedLimitValue) && row.meter !== 'quantity'
      ? formatUsageLimitValue({ value: parsedLimitValue, meter: row.meter })
      : undefined;

  return (
    <DialogInstance
      dialogId={dialogId}
      dismissible
      onClose={handleClose}
      renderInDocumentBody
    >
      {({ container, backdrop, viewportProps, onKeyDown }) => (
        <Dialog.Popup
          {...{ container, backdrop, viewportProps, onKeyDown }}
          size="md"
          data-globally-prevent-click-outside
          style={{
            padding: 'var(--t-spacing-6)',
            borderRadius: 'var(--t-spacing-1)',
            width: '360px',
          }}
        >
          <Dialog.Title>
            {row.isOverridden ? t`Edit limit` : t`Override limit`}
          </Dialog.Title>
          <StyledSectionContainer>
            <Section.Root align="center" color="primary">
              {t`${scopeLabel} — the instance default is ${defaultText}. Saving applies to this workspace only.`}
            </Section.Root>
            {isDefined(unenforcedNotice) && (
              <Section.Root align="center" color="primary">
                {unenforcedNotice}
              </Section.Root>
            )}
          </StyledSectionContainer>

          <StyledFields>
            <SettingsTextInput
              instanceId={`${dialogId}-limit-value`}
              label={isDefined(meterLabel) ? t(meterLabel) : t`Limit`}
              type="number"
              min={1}
              value={limitValue}
              onChange={setLimitValue}
              rightAdornment={limitValueAdornment}
              autoFocusOnMount
              fullWidth
            />

            {isBurstAllowed && (
              <SettingsTextInput
                instanceId={`${dialogId}-burst-value`}
                label={t`Burst`}
                placeholder={t`Same as the limit`}
                type="number"
                min={1}
                value={burstValue}
                onChange={setBurstValue}
                fullWidth
              />
            )}
          </StyledFields>

          <StyledActions>
            {row.isOverridden && (
              <StyledActionSlot>
                <Button
                  onClick={handleReset}
                  fullWidth
                  disabled={isBusy}
                  variant="outline"
                  color="danger"
                >{t`Reset`}</Button>
              </StyledActionSlot>
            )}
            <StyledActionSlot>
              <Button
                onClick={handleClose}
                fullWidth
                variant="outline"
              >{t`Cancel`}</Button>
            </StyledActionSlot>
            <StyledActionSlot>
              <Button
                onClick={handleSubmit}
                fullWidth
                disabled={!isValid || isBusy}
                variant="solid"
                color="accent"
              >{t`Save`}</Button>
            </StyledActionSlot>
          </StyledActions>
        </Dialog.Popup>
      )}
    </DialogInstance>
  );
};
