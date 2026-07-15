import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { TextArea } from '@/ui/input/components/TextArea';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useMutation } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { Tag } from 'twenty-ui/data-display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { H2Title } from 'twenty-ui/typography';
import {
  ApplicationRegistrationListingReviewDecision,
  FindApplicationRegistrationListingRequestsDocument,
  FindOneAdminApplicationRegistrationDocument,
  ReviewApplicationRegistrationListingDocument,
} from '~/generated-admin/graphql';
import { type ApplicationRegistration } from '~/generated-metadata/graphql';

const LISTING_REVIEW_MODAL_ID = 'admin-listing-review-modal';

const StyledStatusRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  margin-bottom: ${themeCssVariables.spacing[3]};
`;

const StyledActionsRow = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledReasonContainer = styled.div`
  margin-top: ${themeCssVariables.spacing[4]};
  text-align: left;
`;

export const SettingsAdminApplicationRegistrationListingReview = ({
  registration,
}: {
  registration: ApplicationRegistration;
}) => {
  const { t } = useLingui();
  const apolloAdminClient = useApolloAdminClient();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const { openModal, closeModal } = useModal();

  const [reason, setReason] = useState('');
  const [pendingDecision, setPendingDecision] =
    useState<ApplicationRegistrationListingReviewDecision | null>(null);

  const [reviewListing, { loading: isReviewing }] = useMutation(
    ReviewApplicationRegistrationListingDocument,
    {
      client: apolloAdminClient,
      refetchQueries: [
        FindOneAdminApplicationRegistrationDocument,
        FindApplicationRegistrationListingRequestsDocument,
      ],
    },
  );

  const submitReview = async (
    decision: ApplicationRegistrationListingReviewDecision,
    decisionReason: string | null,
  ) => {
    try {
      await reviewListing({
        variables: {
          applicationRegistrationId: registration.id,
          decision,
          reason: decisionReason,
        },
      });

      const message =
        decision === ApplicationRegistrationListingReviewDecision.APPROVED
          ? t`Listing approved. Installation is now allowed.`
          : decision ===
              ApplicationRegistrationListingReviewDecision.CHANGE_REQUESTED
            ? t`Changes requested. The developer has been notified.`
            : t`Listing rejected. The developer has been notified.`;

      enqueueSuccessSnackBar({ message });
    } catch (error) {
      enqueueErrorSnackBar({
        message:
          error instanceof Error
            ? error.message
            : t`Failed to review the listing request`,
      });
    }
  };

  const handleOpenDecisionModal = (
    decision: ApplicationRegistrationListingReviewDecision,
  ) => {
    setReason('');
    setPendingDecision(decision);
    openModal(LISTING_REVIEW_MODAL_ID);
  };

  const handleConfirmDecision = async () => {
    if (pendingDecision === null) {
      return;
    }

    const trimmedReason = reason.trim();

    await submitReview(
      pendingDecision,
      trimmedReason.length > 0 ? trimmedReason : null,
    );
    closeModal(LISTING_REVIEW_MODAL_ID);
    setPendingDecision(null);
  };

  const isRejection =
    pendingDecision === ApplicationRegistrationListingReviewDecision.REJECTED;

  return (
    <Section>
      <H2Title
        title={t`Listing request`}
        description={t`The owner asked to list this app in the marketplace. Your decision will be emailed to ${registration.listingRequestContactEmail ?? t`the requester`}.`}
      />
      <StyledStatusRow>
        <Tag text={t`Review pending`} color="orange" />
      </StyledStatusRow>
      <StyledActionsRow>
        <Button
          title={t`Approve`}
          accent="blue"
          disabled={isReviewing}
          onClick={() =>
            submitReview(
              ApplicationRegistrationListingReviewDecision.APPROVED,
              null,
            )
          }
        />
        <Button
          title={t`Request changes`}
          variant="secondary"
          disabled={isReviewing}
          onClick={() =>
            handleOpenDecisionModal(
              ApplicationRegistrationListingReviewDecision.CHANGE_REQUESTED,
            )
          }
        />
        <Button
          title={t`Reject`}
          variant="secondary"
          accent="danger"
          disabled={isReviewing}
          onClick={() =>
            handleOpenDecisionModal(
              ApplicationRegistrationListingReviewDecision.REJECTED,
            )
          }
        />
      </StyledActionsRow>
      <ConfirmationModal
        modalInstanceId={LISTING_REVIEW_MODAL_ID}
        title={isRejection ? t`Reject listing request` : t`Request changes`}
        subtitle={
          <>
            {isRejection
              ? t`The request will be rejected and the requester notified by email.`
              : t`The requester will be asked by email to update their listing before resubmitting.`}
            <StyledReasonContainer>
              <TextArea
                textAreaId="listing-review-reason"
                label={t`Reason (optional)`}
                placeholder={t`Explain your decision to the developer`}
                value={reason}
                onChange={setReason}
                minRows={3}
              />
            </StyledReasonContainer>
          </>
        }
        onConfirmClick={handleConfirmDecision}
        confirmButtonText={isRejection ? t`Reject` : t`Request changes`}
        confirmButtonAccent={isRejection ? 'danger' : 'blue'}
        loading={isReviewing}
      />
    </Section>
  );
};
