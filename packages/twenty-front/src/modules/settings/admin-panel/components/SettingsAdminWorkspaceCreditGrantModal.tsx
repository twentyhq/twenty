import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { IconX } from 'twenty-ui/icon';
import { Button, IconButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { H2Title } from 'twenty-ui/typography';

import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { CREDIT_GRANT_TYPE_LABELS } from '@/settings/admin-panel/constants/CreditGrantTypeLabels';
import { GRANTABLE_CREDIT_GRANT_TYPES } from '@/settings/admin-panel/constants/GrantableCreditGrantTypes';
import { GRANT_WORKSPACE_CREDITS } from '@/settings/admin-panel/graphql/mutations/grantWorkspaceCredits';
import { GET_WORKSPACE_BILLING_ADMIN_PANEL } from '@/settings/admin-panel/graphql/queries/getWorkspaceBillingAdminPanel';
import { Select } from '@/ui/input/components/Select';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { ModalStatefulWrapper } from '@/ui/layout/modal/components/ModalStatefulWrapper';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { BillingCreditGrantType } from '~/generated-admin/graphql';

type SettingsAdminWorkspaceCreditGrantModalProps = {
  modalInstanceId: string;
  workspaceId: string;
};

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  padding: ${themeCssVariables.spacing[6]};
`;

const StyledHeader = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
`;

const StyledFooter = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: flex-end;
`;

export const SettingsAdminWorkspaceCreditGrantModal = ({
  modalInstanceId,
  workspaceId,
}: SettingsAdminWorkspaceCreditGrantModalProps) => {
  const { t } = useLingui();
  const { closeModal } = useModal();
  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();
  const apolloAdminClient = useApolloAdminClient();

  const [amount, setAmount] = useState('');
  const [type, setType] = useState<BillingCreditGrantType>(
    BillingCreditGrantType.COMPENSATION,
  );
  const [reason, setReason] = useState('');

  const [grantWorkspaceCredits, { loading }] = useMutation(
    GRANT_WORKSPACE_CREDITS,
    {
      client: apolloAdminClient,
      refetchQueries: [GET_WORKSPACE_BILLING_ADMIN_PANEL],
    },
  );

  const parsedAmount = Number(amount);
  const isAmountValid = Number.isFinite(parsedAmount) && parsedAmount > 0;

  // The modal is mounted for the whole page, so without this the next admin to
  // open it starts from the last grant's amount and reason.
  const handleClose = () => {
    setAmount('');
    setType(BillingCreditGrantType.COMPENSATION);
    setReason('');
    closeModal(modalInstanceId);
  };

  const handleSubmit = async () => {
    if (!isAmountValid) {
      return;
    }

    const trimmedReason = reason.trim();

    try {
      await grantWorkspaceCredits({
        variables: {
          workspaceId,
          amount: parsedAmount,
          type,
          reason: trimmedReason || null,
        },
      });

      enqueueSuccessSnackBar({
        message: t`Granted ${parsedAmount} credits to this workspace.`,
      });
      handleClose();
    } catch (error) {
      enqueueErrorSnackBar({
        apolloError: CombinedGraphQLErrors.is(error) ? error : undefined,
      });
    }
  };

  return (
    <ModalStatefulWrapper
      modalInstanceId={modalInstanceId}
      size="medium"
      padding="none"
      isClosable
      onClose={handleClose}
      renderInDocumentBody
    >
      <StyledContent>
        <StyledHeader>
          <H2Title
            title={t`Grant credits`}
            description={t`Credits are added on top of the plan allowance and expire at the end of the current billing period. Unused granted credits carry over in full.`}
          />
          <IconButton Icon={IconX} onClick={handleClose} size="small" />
        </StyledHeader>

        <SettingsTextInput
          instanceId={`${modalInstanceId}-amount`}
          label={t`Amount`}
          placeholder="200"
          type="number"
          min={0}
          leftAdornment="$"
          value={amount}
          onChange={setAmount}
          autoFocusOnMount
          fullWidth
        />

        <Select
          dropdownId={`${modalInstanceId}-type`}
          label={t`Type`}
          value={type}
          options={GRANTABLE_CREDIT_GRANT_TYPES.map((grantType) => ({
            value: grantType,
            label: t(CREDIT_GRANT_TYPE_LABELS[grantType]),
          }))}
          onChange={setType}
          fullWidth
        />

        <SettingsTextInput
          instanceId={`${modalInstanceId}-reason`}
          label={t`Reason`}
          placeholder={t`Goodwill gesture after the March incident`}
          value={reason}
          onChange={setReason}
          maxLength={500}
          fullWidth
        />

        <StyledFooter>
          <Button title={t`Cancel`} variant="secondary" onClick={handleClose} />
          <Button
            title={t`Grant`}
            accent="blue"
            disabled={!isAmountValid || loading}
            onClick={handleSubmit}
          />
        </StyledFooter>
      </StyledContent>
    </ModalStatefulWrapper>
  );
};
