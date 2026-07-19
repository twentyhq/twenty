import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Avatar } from 'twenty-ui/data-display';

import { EmailRecipientChipMenuContent } from '@/activities/emails/recipients/components/EmailRecipientChipMenuContent';
import { type EmailRecipientResolution } from '@/activities/emails/recipients/hooks/useEmailRecipientsResolution';
import { type EmailRecipient } from '@/activities/emails/recipients/types/EmailRecipient';
import { formatEmailRecipient } from '@/activities/emails/recipients/utils/formatEmailRecipient';
import { getEmailIdentityDisplayName } from '@/activities/emails/utils/getEmailIdentityDisplayName';
import { BaseChip } from '@/object-record/record-field/ui/form-types/components/BaseChip';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

const CHIP_MAX_WIDTH = 240;

type EmailRecipientsFieldChipProps = {
  chipId: string;
  dropdownId: string;
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
        avatarUrl={getAbsoluteImageUrl(
          workspaceMember?.avatarUrl ?? person?.avatarUrl,
        )}
        placeholder={resolvedLabel}
        placeholderColorSeed={workspaceMember?.id ?? person?.id}
        size="sm"
        type="rounded"
      />
    ) : undefined;

  return (
    <Dropdown
      dropdownId={dropdownId}
      dropdownPlacement="bottom-start"
      clickableComponent={
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
      }
      dropdownComponents={
        <EmailRecipientChipMenuContent
          dropdownId={dropdownId}
          recipient={recipient}
          resolution={resolution}
          isInvalid={isInvalid}
          onEdit={onEdit}
          onRemove={onRemove}
        />
      }
    />
  );
};
