import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { Button } from 'twenty-ui/input';
import { Section, SectionAlignment, SectionFontColor } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { H1Title, H1TitleFontColor } from 'twenty-ui/typography';
import { v4 } from 'uuid';

import { useErrorToast } from '@/error-handler/hooks/useErrorToast';
import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { CREDIT_GRANT_EXPIRY_OPTIONS } from '@/settings/admin-panel/constants/CreditGrantExpiryOptions';
import { CREDIT_GRANT_TYPE_LABELS } from '@/settings/admin-panel/constants/CreditGrantTypeLabels';
import { GRANTABLE_CREDIT_GRANT_TYPES } from '@/settings/admin-panel/constants/GrantableCreditGrantTypes';
import { GRANT_WORKSPACE_CREDITS } from '@/settings/admin-panel/graphql/mutations/grantWorkspaceCredits';
import { GET_WORKSPACE_BILLING_ADMIN_PANEL } from '@/settings/admin-panel/graphql/queries/getWorkspaceBillingAdminPanel';
import { Select } from '@/ui/input/components/Select';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { ModalStatefulWrapper } from '@/ui/layout/modal/components/ModalStatefulWrapper';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useToast } from 'twenty-ui/feedback';
import { BillingCreditGrantType } from '~/generated-admin/graphql';

type SettingsAdminWorkspaceCreditGrantModalProps = {
  modalInstanceId: string;
  workspaceId: string;
};

const StyledCenteredTitle = styled.div`
  text-align: center;
`;

const StyledSectionContainer = styled.div`
  margin-bottom: ${themeCssVariables.spacing[6]};
`;

const StyledFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledModalActions = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  margin-top: ${themeCssVariables.spacing[6]};

  > div {
    flex: 1;
  }
`;

export const SettingsAdminWorkspaceCreditGrantModal = ({
  modalInstanceId,
  workspaceId,
}: SettingsAdminWorkspaceCreditGrantModalProps) => {
  const { t } = useLingui();
  const { closeModal } = useModal();
  const { enqueueToast } = useToast();
  const { enqueueErrorToast } = useErrorToast();
  const apolloAdminClient = useApolloAdminClient();

  const [amount, setAmount] = useState('');
  const [type, setType] = useState<BillingCreditGrantType>(
    BillingCreditGrantType.COMPENSATION,
  );
  const [reason, setReason] = useState('');
  const [expiresInDays, setExpiresInDays] = useState<number | null>(null);
  // Identifies one intended grant, so a RetryLink retry or a resubmit after a
  // lost response is answered with the grant the first attempt wrote rather
  // than crediting the workspace twice. Keyed on the submitted values, since
  // editing the amount and resubmitting is a different intent that must not be
  // answered with the earlier grant.
  const [submittedGrant, setSubmittedGrant] = useState<{
    payload: string;
    clientOperationId: string;
  } | null>(null);

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
    setExpiresInDays(null);
    setSubmittedGrant(null);
    closeModal(modalInstanceId);
  };

  const handleSubmit = async () => {
    if (!isAmountValid) {
      return;
    }

    const trimmedReason = reason.trim();
    const payload = JSON.stringify([
      parsedAmount,
      type,
      trimmedReason,
      expiresInDays,
    ]);

    const clientOperationId =
      submittedGrant?.payload === payload
        ? submittedGrant.clientOperationId
        : v4();

    setSubmittedGrant({ payload, clientOperationId });

    try {
      await grantWorkspaceCredits({
        variables: {
          workspaceId,
          amount: parsedAmount,
          type,
          reason: trimmedReason || null,
          expiresInDays,
          clientOperationId,
        },
      });

      enqueueToast({
        variant: 'success',
        children: t`Granted ${parsedAmount} credits to this workspace.`,
      });
      handleClose();
    } catch (error) {
      enqueueErrorToast(CombinedGraphQLErrors.is(error) ? error : undefined);
    }
  };

  return (
    <ModalStatefulWrapper
      modalInstanceId={modalInstanceId}
      onClose={handleClose}
      isClosable
      size="medium"
      padding="large"
      overlay="dark"
      width="360px"
      dataGloballyPreventClickOutside
      renderInDocumentBody
      smallBorderRadius
      autoHeight
    >
      <StyledCenteredTitle>
        <H1Title
          title={t`Grant credits`}
          fontColor={H1TitleFontColor.Primary}
        />
      </StyledCenteredTitle>
      <StyledSectionContainer>
        <Section
          alignment={SectionAlignment.Center}
          fontColor={SectionFontColor.Primary}
        >
          {t`Credits are added on top of the plan allowance and are spent only once it runs out. They carry over in full from one billing period to the next, and stay available until they are used up or, where an expiry is set, until the end of the billing period that expiry falls in.`}
        </Section>
      </StyledSectionContainer>

      <StyledFields>
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
          isDropdownInModal
          fullWidth
        />

        <Select
          dropdownId={`${modalInstanceId}-expires-in-days`}
          label={t`Expires`}
          value={expiresInDays}
          options={CREDIT_GRANT_EXPIRY_OPTIONS.map((option) => ({
            value: option.value,
            label: t(option.label),
          }))}
          onChange={setExpiresInDays}
          isDropdownInModal
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
      </StyledFields>

      <StyledModalActions>
        <Button
          onClick={handleClose}
          variant="secondary"
          title={t`Cancel`}
          fullWidth
          justify="center"
        />
        <Button
          onClick={handleSubmit}
          variant="primary"
          accent="blue"
          title={t`Grant`}
          disabled={!isAmountValid || loading}
          fullWidth
          justify="center"
        />
      </StyledModalActions>
    </ModalStatefulWrapper>
  );
};
