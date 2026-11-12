import { useMutation } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import { Button } from 'twenty-ui/primitives/input';
import { Dialog } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';

import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { ADMIN_MANAGED_BILLING_ARRANGEMENT_TYPES } from '@/settings/admin-panel/constants/AdminManagedBillingArrangementTypes';
import { BILLING_ARRANGEMENT_REASON_LABELS } from '@/settings/admin-panel/constants/BillingArrangementReasonLabels';
import { BILLING_ARRANGEMENT_SEAT_CAP_MODE_LABELS } from '@/settings/admin-panel/constants/BillingArrangementSeatCapModeLabels';
import { BILLING_ARRANGEMENT_TYPE_LABELS } from '@/settings/admin-panel/constants/BillingArrangementTypeLabels';
import { CREATE_WORKSPACE_BILLING_ARRANGEMENT } from '@/settings/admin-panel/graphql/mutations/createWorkspaceBillingArrangement';
import { GET_WORKSPACE_BILLING_ADMIN_PANEL } from '@/settings/admin-panel/graphql/queries/getWorkspaceBillingAdminPanel';
import { SettingsDatePickerInput } from '@/settings/components/SettingsDatePickerInput';
import { Select } from '@/ui/input/components/Select';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { DialogInstance } from '@/ui/layout/dialog/components/DialogInstance';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import {
  BillingArrangementLabel,
  BillingArrangementSeatCapMode,
  BillingArrangementType,
} from '~/generated-admin/graphql';

type SettingsAdminWorkspaceBillingArrangementModalProps = {
  modalInstanceId: string;
  workspaceId: string;
};

const StyledFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledActionSlot = styled.div`
  flex: 1;
`;

const COMMENT_MAX_LENGTH = 500;

const TYPE_DESCRIPTIONS: Partial<
  Record<BillingArrangementType, MessageDescriptor>
> = {
  [BillingArrangementType.FREE_SEATS]: msg`This many members are not billed. Seats are synced right away.`,
  [BillingArrangementType.COMMITTED_SEATS]: msg`At least this many seats are billed until the end date. A hard cap also blocks new members above it.`,
  [BillingArrangementType.WORKSPACE_CREDIT_ALLOWANCE]: msg`Replaces the plan's included workspace credits with a fixed amount per month, starting now. Paid and granted credits still add on top.`,
};

const parseSeats = (value: string): number | null => {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed >= 1 ? parsed : null;
};

const parseCreditAllowance = (value: string): number | null => {
  const parsed = Number(value);

  return value.trim() !== '' && Number.isFinite(parsed) && parsed >= 0
    ? parsed
    : null;
};

export const SettingsAdminWorkspaceBillingArrangementModal = ({
  modalInstanceId,
  workspaceId,
}: SettingsAdminWorkspaceBillingArrangementModalProps) => {
  const { t } = useLingui();
  const { closeDialog } = useDialog();
  const { enqueueToast } = useToast();
  const apolloAdminClient = useApolloAdminClient();

  const [type, setType] = useState<BillingArrangementType>(
    BillingArrangementType.FREE_SEATS,
  );
  const [seats, setSeats] = useState('');
  const [seatCapMode, setSeatCapMode] = useState<BillingArrangementSeatCapMode>(
    BillingArrangementSeatCapMode.SOFT,
  );
  const [creditAllowance, setCreditAllowance] = useState('');
  const [endsAt, setEndsAt] = useState<Date | undefined>(undefined);
  const [label, setLabel] = useState<BillingArrangementLabel>(
    BillingArrangementLabel.OTHER,
  );
  const [comment, setComment] = useState('');

  const [createWorkspaceBillingArrangement, { loading }] = useMutation(
    CREATE_WORKSPACE_BILLING_ARRANGEMENT,
    {
      client: apolloAdminClient,
      refetchQueries: [GET_WORKSPACE_BILLING_ADMIN_PANEL],
    },
  );

  const isSeatType =
    type === BillingArrangementType.COMMITTED_SEATS ||
    type === BillingArrangementType.FREE_SEATS;
  const isCommittedSeats = type === BillingArrangementType.COMMITTED_SEATS;
  const isCreditAllowance =
    type === BillingArrangementType.WORKSPACE_CREDIT_ALLOWANCE;

  const parsedSeats = parseSeats(seats);
  const parsedCreditAllowance = parseCreditAllowance(creditAllowance);

  const isEndsAtValid = isDefined(endsAt)
    ? endsAt.getTime() > Date.now()
    : !isCommittedSeats;

  const isValid =
    isEndsAtValid &&
    (!isSeatType || isDefined(parsedSeats)) &&
    (!isCreditAllowance || isDefined(parsedCreditAllowance));

  const typeDescription = TYPE_DESCRIPTIONS[type];

  // The modal stays mounted, so reset it for the next admin.
  const handleClose = () => {
    setType(BillingArrangementType.FREE_SEATS);
    setSeats('');
    setSeatCapMode(BillingArrangementSeatCapMode.SOFT);
    setCreditAllowance('');
    setEndsAt(undefined);
    setLabel(BillingArrangementLabel.OTHER);
    setComment('');
    closeDialog(modalInstanceId);
  };

  const handleSubmit = async () => {
    if (!isValid) {
      return;
    }

    const trimmedComment = comment.trim();

    try {
      await createWorkspaceBillingArrangement({
        variables: {
          workspaceId,
          type,
          label,
          comment: trimmedComment || null,
          endsAt: endsAt?.toISOString() ?? null,
          seats: isSeatType ? parsedSeats : null,
          seatCapMode: isCommittedSeats ? seatCapMode : null,
          creditAllowance: isCreditAllowance ? parsedCreditAllowance : null,
        },
      });

      enqueueToast({ status: 'success', children: t`Arrangement added.` });
      handleClose();
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
    }
  };

  return (
    <DialogInstance
      dialogId={modalInstanceId}
      dismissible
      onClose={handleClose}
      renderInDocumentBody
    >
      {({ onKeyDown }) => (
        <Dialog.Popup
          onKeyDown={onKeyDown}
          size="compact"
          data-globally-prevent-click-outside
        >
          <Dialog.Header>
            <Dialog.Title>{t`Add arrangement`}</Dialog.Title>
            {isDefined(typeDescription) && (
              <Dialog.Description>{t(typeDescription)}</Dialog.Description>
            )}
          </Dialog.Header>
          <Dialog.Body>
            <StyledFields>
              <Select
                dropdownId={`${modalInstanceId}-type`}
                label={t`Type`}
                value={type}
                options={ADMIN_MANAGED_BILLING_ARRANGEMENT_TYPES.map(
                  (arrangementType) => ({
                    value: arrangementType,
                    label: t(BILLING_ARRANGEMENT_TYPE_LABELS[arrangementType]),
                  }),
                )}
                onChange={setType}
                fullWidth
              />

              {isSeatType && (
                <SettingsTextInput
                  instanceId={`${modalInstanceId}-seats`}
                  label={t`Seats`}
                  placeholder="10"
                  type="number"
                  min={1}
                  value={seats}
                  onChange={setSeats}
                  fullWidth
                />
              )}

              {isCommittedSeats && (
                <Select
                  dropdownId={`${modalInstanceId}-seat-cap-mode`}
                  label={t`Above the commitment`}
                  value={seatCapMode}
                  options={Object.values(BillingArrangementSeatCapMode).map(
                    (capMode) => ({
                      value: capMode,
                      label: t(
                        BILLING_ARRANGEMENT_SEAT_CAP_MODE_LABELS[capMode],
                      ),
                    }),
                  )}
                  onChange={setSeatCapMode}
                  fullWidth
                />
              )}

              {isCreditAllowance && (
                <SettingsTextInput
                  instanceId={`${modalInstanceId}-credit-allowance`}
                  label={t`Credits per month`}
                  placeholder="100"
                  type="number"
                  min={0}
                  leftAdornment="$"
                  value={creditAllowance}
                  onChange={setCreditAllowance}
                  fullWidth
                />
              )}

              <SettingsDatePickerInput
                instanceId={`${modalInstanceId}-ends-at`}
                label={isCommittedSeats ? t`Ends` : t`Ends (optional)`}
                placeholder={
                  isCommittedSeats ? t`Pick the end date` : t`No end date`
                }
                value={endsAt}
                onChange={setEndsAt}
                isInModal
              />

              <Select
                dropdownId={`${modalInstanceId}-label`}
                label={t`Reason`}
                value={label}
                options={Object.values(BillingArrangementLabel).map(
                  (arrangementLabel) => ({
                    value: arrangementLabel,
                    label: t(
                      BILLING_ARRANGEMENT_REASON_LABELS[arrangementLabel],
                    ),
                  }),
                )}
                onChange={setLabel}
                fullWidth
              />

              <SettingsTextInput
                instanceId={`${modalInstanceId}-comment`}
                label={t`Comment`}
                placeholder={t`Signed a 2-year deal for 25 seats`}
                value={comment}
                onChange={setComment}
                maxLength={COMMENT_MAX_LENGTH}
                fullWidth
              />
            </StyledFields>
          </Dialog.Body>
          <Dialog.Footer>
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
                disabled={!isValid || loading}
                variant="solid"
                color="accent"
              >{t`Add`}</Button>
            </StyledActionSlot>
          </Dialog.Footer>
        </Dialog.Popup>
      )}
    </DialogInstance>
  );
};
