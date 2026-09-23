import { useMutation } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components';
import { useToast } from 'twenty-ui/primitives/feedback';
import { Button } from 'twenty-ui/primitives/input';
import { Dialog } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { ADMIN_USAGE_LIMIT_METER_LABELS } from '@/settings/admin-panel/constants/UsageLimitMeterLabels';
import { CREATE_WORKSPACE_USAGE_LIMIT } from '@/settings/admin-panel/graphql/mutations/createWorkspaceUsageLimit';
import { DELETE_WORKSPACE_USAGE_LIMIT } from '@/settings/admin-panel/graphql/mutations/deleteWorkspaceUsageLimit';
import { UPDATE_WORKSPACE_USAGE_LIMIT } from '@/settings/admin-panel/graphql/mutations/updateWorkspaceUsageLimit';
import { WORKSPACE_USAGE_LIMITS } from '@/settings/admin-panel/graphql/queries/workspaceUsageLimits';
import { type AdminUsageLimitRow } from '@/settings/admin-panel/types/AdminUsageLimitRow';
import { formatUsageLimitValue } from '@/settings/admin-panel/utils/formatUsageLimitValue';
import { getAdminUsageLimitScopeLabel } from '@/settings/admin-panel/utils/getAdminUsageLimitScopeLabel';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { DialogInstance } from '@/ui/layout/dialog/components/DialogInstance';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';

type SettingsAdminWorkspaceUsageLimitModalProps = {
  dialogId: string;
  workspaceId: string;
  row: AdminUsageLimitRow | null;
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

  const [limitValue, setLimitValue] = useState('');
  const [burstValue, setBurstValue] = useState('');

  // The dialog stays mounted for the whole tab, so without this the next row
  // opened starts from the previous row's numbers.
  useEffect(() => {
    setLimitValue(isDefined(row) ? String(row.limitValue) : '');
    setBurstValue(
      isDefined(row) && isDefined(row.burstValue) ? String(row.burstValue) : '',
    );
  }, [row]);

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

  if (!isDefined(row)) {
    return null;
  }

  const parsedLimitValue = parsePositiveInteger(limitValue);
  const parsedBurstValue =
    burstValue.trim() === '' ? null : parsePositiveInteger(burstValue);
  const isBurstAllowed = row.limitKind === 'speed';
  const isBusy = isCreating || isUpdating || isResetting;
  const isValid =
    isDefined(parsedLimitValue) &&
    (!isBurstAllowed ||
      burstValue.trim() === '' ||
      isDefined(parsedBurstValue));

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

  const meterLabel = ADMIN_USAGE_LIMIT_METER_LABELS[row.meter];
  const defaultText = formatUsageLimitValue({
    value: row.defaultValue,
    meter: row.meter,
  });

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
              {getAdminUsageLimitScopeLabel(row)}
              {t` — the instance default is ${defaultText}. Saving applies to this workspace only.`}
              {row.suppressedTogetherCount > 1 &&
                t` This scope carries ${row.suppressedTogetherCount} instance caps and one override replaces all of them, so the others stop being enforced until you restate them.`}
            </Section.Root>
          </StyledSectionContainer>

          <StyledFields>
            <SettingsTextInput
              instanceId={`${dialogId}-limit-value`}
              label={isDefined(meterLabel) ? t(meterLabel) : t`Limit`}
              type="number"
              min={1}
              value={limitValue}
              onChange={setLimitValue}
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
