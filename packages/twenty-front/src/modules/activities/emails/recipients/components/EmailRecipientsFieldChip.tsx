import { type RefObject } from 'react';
import { Dropdown } from 'twenty-ui/components';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Avatar } from 'twenty-ui/primitives/data-display';

import { EmailRecipientChipMenuContent } from '@/activities/emails/recipients/components/EmailRecipientChipMenuContent';
import { type EmailRecipientResolution } from '@/activities/emails/recipients/hooks/useEmailRecipientsResolution';
import { type EmailRecipient } from '@/activities/emails/recipients/types/EmailRecipient';
import { formatEmailRecipient } from '@/activities/emails/recipients/utils/formatEmailRecipient';
import { getEmailIdentityDisplayName } from '@/activities/emails/utils/getEmailIdentityDisplayName';
import { BaseChip } from '@/ui/input/components/BaseChip';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

const CHIP_MAX_WIDTH = 240;

type EmailRecipientsFieldChipProps = {
  chipId: string;
  dropdownId: string;
  inputRef: RefObject<HTMLInputElement | null>;
  recipient: EmailRecipient;
  resolution: EmailRecipientResolution | undefined;
  isInvalid: boolean;
  selected: boolean;
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
  selected,
  isFlashing,
  onEdit,
  onRemove,
}: EmailRecipientsFieldChipProps) => {
  const { t } = useLingui();

  const workspaceMember = resolution?.workspaceMember;
  const person = resolution?.person;

  const workspaceMemberFullName = isDefined(workspaceMember)
    ? `${workspaceMember.name.firstName} ${workspaceMember.name.lastName}`.trim()
    : '';
  const personFullName = isDefined(person)
    ? `${person.firstName} ${person.lastName}`.trim()
    : '';

  const resolvedLabel = getEmailIdentityDisplayName({
    personName: personFullName,
    workspaceMemberName: workspaceMemberFullName,
    displayName: recipient.displayName,
    handle: recipient.address,
  });

  const avatar =
    isDefined(workspaceMember) || isDefined(person) ? (
      <Avatar
        src={getAbsoluteImageUrl(
          workspaceMember?.avatarUrl ?? person?.avatarUrl,
        )}
        name={resolvedLabel}
        colorSeed={workspaceMember?.id ?? person?.id}
        size="sm"
        shape="circle"
      />
    ) : undefined;

  return (
    <DropdownRoot dropdownId={dropdownId} type="menu">
      <Dropdown.Trigger render={<div />} nativeButton={false} tabIndex={-1}>
        <BaseChip
          chipId={chipId}
          label={resolvedLabel}
          title={
            isInvalid
              ? t`Invalid email address`
              : formatEmailRecipient(recipient)
          }
          leftIcon={avatar}
          danger={isInvalid}
          selected={selected}
          isFlashing={isFlashing}
          onDoubleClick={onEdit}
          maxWidth={CHIP_MAX_WIDTH}
          onRemove={(event) => {
            event.stopPropagation();
            onRemove();
          }}
          removeAriaLabel={t`Remove ${recipient.address}`}
        />
      </Dropdown.Trigger>
      <DropdownContent align="start" width={280} finalFocus={inputRef}>
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
