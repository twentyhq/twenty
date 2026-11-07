import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { useId } from 'react';
import { Checkbox } from 'twenty-ui/primitives/input';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { themeCssVariables } from 'twenty-ui/theme';

import { RecordSharingInvitationRecipientIcon } from '@/object-record/record-sharing/components/RecordSharingInvitationRecipientIcon';
import { type RecordSharingInvitationRecipient } from '@/object-record/record-sharing/types/RecordSharingInvitationRecipient';
import { isSameRecordSharingInvitationRecipient } from '@/object-record/record-sharing/utils/isSameRecordSharingInvitationRecipient';

const StyledContent = styled.span`
  align-items: baseline;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
`;

const StyledLabel = styled.span`
  flex-shrink: 0;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledDescription = styled.span`
  color: ${themeCssVariables.font.color.light};
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledSeparator = styled.span`
  color: ${themeCssVariables.font.color.light};
  flex-shrink: 0;
`;

type RecordSharingInvitationRecipientPickerProps = {
  recipients: RecordSharingInvitationRecipient[];
  selectedRecipients: RecordSharingInvitationRecipient[];
  disabled: boolean;
  onRecipientsChange: (recipients: RecordSharingInvitationRecipient[]) => void;
};

export const RecordSharingInvitationRecipientPicker = ({
  recipients,
  selectedRecipients,
  disabled,
  onRecipientsChange,
}: RecordSharingInvitationRecipientPickerProps) => {
  const pickerId = useId();
  const isSelected = (recipient: RecordSharingInvitationRecipient) =>
    selectedRecipients.some((selectedRecipient) =>
      isSameRecordSharingInvitationRecipient({
        recipient,
        otherRecipient: selectedRecipient,
      }),
    );

  return (
    <>
      {recipients.map((recipient) => {
        const checkboxId = `${pickerId}-${recipient.kind}-${recipient.id}`;

        return (
          <ListItem
            key={`${recipient.kind}-${recipient.id}`}
            disabled={disabled}
            render={<label htmlFor={checkboxId} />}
            startIcon={
              <RecordSharingInvitationRecipientIcon recipient={recipient} />
            }
            endIcon={
              <Checkbox
                id={checkboxId}
                aria-label={recipient.label}
                checked={isSelected(recipient)}
                disabled={disabled}
                onCheckedChange={(checked) => {
                  if (!checked) {
                    onRecipientsChange(
                      selectedRecipients.filter(
                        (selectedRecipient) =>
                          !isSameRecordSharingInvitationRecipient({
                            recipient,
                            otherRecipient: selectedRecipient,
                          }),
                      ),
                    );
                    return;
                  }

                  onRecipientsChange([...selectedRecipients, recipient]);
                }}
              />
            }
          >
            <StyledContent>
              <StyledLabel>{recipient.label}</StyledLabel>
              {isNonEmptyString(recipient.description) && (
                <>
                  <StyledSeparator>·</StyledSeparator>
                  <StyledDescription>{recipient.description}</StyledDescription>
                </>
              )}
            </StyledContent>
          </ListItem>
        );
      })}
    </>
  );
};
