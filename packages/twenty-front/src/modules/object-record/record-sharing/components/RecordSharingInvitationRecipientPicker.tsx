import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { Dropdown, ListItemButton } from 'twenty-ui/components/navigation';

import { RecordSharingInvitationRecipientIcon } from '@/object-record/record-sharing/components/RecordSharingInvitationRecipientIcon';

import { type RecordSharingInvitationRecipient } from '@/object-record/record-sharing/types/RecordSharingInvitationRecipient';
import { isSameRecordSharingInvitationRecipient } from '@/object-record/record-sharing/utils/isSameRecordSharingInvitationRecipient';

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
  const { t } = useLingui();
  const [search, setSearch] = useState('');
  const matchingRecipients = recipients.filter((recipient) =>
    recipient.label.toLowerCase().includes(search.trim().toLowerCase()),
  );
  const isSelected = (recipient: RecordSharingInvitationRecipient) =>
    selectedRecipients.some((selectedRecipient) =>
      isSameRecordSharingInvitationRecipient({
        recipient,
        otherRecipient: selectedRecipient,
      }),
    );

  return (
    <Dropdown.Root type="picker" multiple>
      <Dropdown.Trigger
        disabled={disabled}
        render={<ListItemButton>{t`Add people or everyone`}</ListItemButton>}
      />
      <Dropdown.Content
        aria-label={t`Invitation recipients`}
        align="start"
        width={320}
      >
        <Dropdown.Search
          aria-label={t`Search people or roles`}
          placeholder={t`Search people or roles`}
          value={search}
          onValueChange={setSearch}
        />
        <Dropdown.Section>
          {matchingRecipients.map((recipient) => (
            <Dropdown.OptionItem
              key={`${recipient.kind}-${recipient.id}`}
              selected={isSelected(recipient)}
              disabled={disabled}
              startIcon={
                <RecordSharingInvitationRecipientIcon recipient={recipient} />
              }
              onSelect={() => {
                if (isSelected(recipient)) {
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
            >
              {recipient.label}
            </Dropdown.OptionItem>
          ))}
          {!isNonEmptyArray(matchingRecipients) && (
            <Dropdown.Empty>{t`No matching people or roles`}</Dropdown.Empty>
          )}
        </Dropdown.Section>
      </Dropdown.Content>
    </Dropdown.Root>
  );
};
