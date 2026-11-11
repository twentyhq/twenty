import { type RefObject } from 'react';
import { Dropdown } from 'twenty-ui/components/navigation';
import { useLingui } from '@lingui/react/macro';

import { EmailRecipientChip } from '@/activities/emails/recipients/components/EmailRecipientChip';
import { EmailRecipientChipMenuContent } from '@/activities/emails/recipients/components/EmailRecipientChipMenuContent';
import { type EmailRecipientResolution } from '@/activities/emails/recipients/hooks/useEmailRecipientsResolution';
import { type EmailRecipient } from '@/activities/emails/recipients/types/EmailRecipient';
import { formatEmailRecipient } from '@/activities/emails/recipients/utils/formatEmailRecipient';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';

type EmailRecipientsFieldChipProps = {
  chipId: string;
  dropdownId: string;
  inputRef: RefObject<HTMLInputElement | null>;
  recipient: EmailRecipient;
  resolution: EmailRecipientResolution | undefined;
  isInvalid: boolean;
  isSelected: boolean;
  isFlashing: boolean;
  onEdit: () => void;
  onRemove: () => void;
};

export const EmailRecipientsFieldChip = ({
  chipId,
  dropdownId,
  inputRef,
  recipient,
  resolution,
  isInvalid,
  isSelected,
  isFlashing,
  onEdit,
  onRemove,
}: EmailRecipientsFieldChipProps) => {
  const { t } = useLingui();

  return (
    <DropdownRoot dropdownId={dropdownId} type="menu">
      <Dropdown.Trigger render={<div />} nativeButton={false} tabIndex={-1}>
        <EmailRecipientChip
          chipId={chipId}
          recipient={recipient}
          resolution={resolution}
          title={
            isInvalid
              ? t`Invalid email address`
              : formatEmailRecipient(recipient)
          }
          isInvalid={isInvalid}
          isSelected={isSelected}
          isFlashing={isFlashing}
          onDoubleClick={onEdit}
          onRemove={(event) => {
            event.stopPropagation();
            onRemove();
          }}
          removeAriaLabel={t`Remove ${recipient.address}`}
        />
      </Dropdown.Trigger>
      <DropdownContent
        align="start"
        width={280}
        initialFocus={false}
        finalFocus={inputRef}
      >
        <EmailRecipientChipMenuContent
          recipient={recipient}
          resolution={resolution}
          isInvalid={isInvalid}
          onEdit={onEdit}
          onRemove={onRemove}
        />
      </DropdownContent>
    </DropdownRoot>
  );
};
