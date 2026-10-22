import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconX } from 'twenty-ui/icon';
import { Chip } from 'twenty-ui/primitives/data-display';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { RecordSharingInvitationAccessPicker } from '@/object-record/record-sharing/components/RecordSharingInvitationAccessPicker';
import { RecordSharingInvitationRecipientPicker } from '@/object-record/record-sharing/components/RecordSharingInvitationRecipientPicker';
import { type RecordSharingInvitationRecipient } from '@/object-record/record-sharing/types/RecordSharingInvitationRecipient';
import { isSameRecordSharingInvitationRecipient } from '@/object-record/record-sharing/utils/isSameRecordSharingInvitationRecipient';
import { RecordShareAccessLevel } from '~/generated-metadata/graphql';

const StyledHeader = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  min-height: ${themeCssVariables.spacing[10]};
  padding: 0 ${themeCssVariables.spacing[3]};
`;

const StyledPicker = styled.div`
  flex: 1;
  min-width: 0;
`;

const StyledSelection = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

const StyledActions = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding: 0 ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[2]};
`;

const StyledError = styled.div`
  color: ${themeCssVariables.color.red};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

type RecordSharingInvitationProps = {
  recipients: RecordSharingInvitationRecipient[];
  selectedRecipients: RecordSharingInvitationRecipient[];
  accessLevel: RecordShareAccessLevel;
  canInvite: boolean;
  isSubmitting?: boolean;
  errorMessage?: string;
  onRecipientsChange: (recipients: RecordSharingInvitationRecipient[]) => void;
  onAccessLevelChange: (accessLevel: RecordShareAccessLevel) => void;
  onInvite: () => void;
  onCancel: () => void;
};

export const RecordSharingInvitation = ({
  recipients,
  selectedRecipients,
  accessLevel,
  canInvite,
  isSubmitting = false,
  errorMessage,
  onRecipientsChange,
  onAccessLevelChange,
  onInvite,
  onCancel,
}: RecordSharingInvitationProps) => {
  const { t } = useLingui();
  const isDisabled = !canInvite || isSubmitting;
  const hasSelection = isNonEmptyArray(selectedRecipients);
  const hasEveryoneRecipient = selectedRecipients.some(
    (recipient) => recipient.kind === 'everyone',
  );
  const hasInvalidAccessLevel =
    accessLevel === RecordShareAccessLevel.NONE ||
    (hasEveryoneRecipient && accessLevel === RecordShareAccessLevel.FULL);
  const removeRecipient = (recipient: RecordSharingInvitationRecipient) => {
    onRecipientsChange(
      selectedRecipients.filter(
        (selectedRecipient) =>
          !isSameRecordSharingInvitationRecipient({
            recipient,
            otherRecipient: selectedRecipient,
          }),
      ),
    );
  };

  return (
    <div aria-busy={isSubmitting}>
      <StyledHeader>
        <StyledPicker>
          <RecordSharingInvitationRecipientPicker
            recipients={recipients}
            selectedRecipients={selectedRecipients}
            disabled={isDisabled}
            onRecipientsChange={onRecipientsChange}
          />
        </StyledPicker>
        <Button
          size="sm"
          variant="solid"
          color="accent"
          disabled={isDisabled || !hasSelection || hasInvalidAccessLevel}
          loading={isSubmitting}
          onClick={onInvite}
        >
          {t`Invite`}
        </Button>
      </StyledHeader>
      {hasSelection && (
        <>
          <StyledSelection aria-label={t`Selected recipients`}>
            {selectedRecipients.map((recipient) => (
              <Chip
                key={`${recipient.kind}-${recipient.id}`}
                size="md"
                variant="soft"
                maxWidth={240}
                endElement={
                  <LightIconButton
                    aria-label={t`Remove ${recipient.label}`}
                    disabled={isDisabled}
                    onClick={() => removeRecipient(recipient)}
                  >
                    <IconX />
                  </LightIconButton>
                }
              >
                {recipient.label}
              </Chip>
            ))}
          </StyledSelection>
          <StyledActions>
            <RecordSharingInvitationAccessPicker
              value={accessLevel}
              hasEveryoneRecipient={hasEveryoneRecipient}
              disabled={isDisabled}
              onChange={onAccessLevelChange}
            />
            <Button
              size="sm"
              variant="ghost"
              disabled={isSubmitting}
              onClick={onCancel}
            >
              {t`Cancel`}
            </Button>
          </StyledActions>
        </>
      )}
      {hasInvalidAccessLevel && hasSelection && (
        <StyledError role="alert">
          {t`Choose an access level available to all selected recipients.`}
        </StyledError>
      )}
      {isNonEmptyString(errorMessage) && (
        <StyledError role="alert">{errorMessage}</StyledError>
      )}
    </div>
  );
};
