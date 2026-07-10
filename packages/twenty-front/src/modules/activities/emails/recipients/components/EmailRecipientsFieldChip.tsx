import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import {
  formatEmailAddressWithDisplayName,
  isDefined,
} from 'twenty-shared/utils';
import { Avatar } from 'twenty-ui/data-display';

import { EmailRecipientChipMenuContent } from '@/activities/emails/recipients/components/EmailRecipientChipMenuContent';
import { type EmailRecipientResolution } from '@/activities/emails/recipients/hooks/useEmailRecipientsResolution';
import { type EmailRecipient } from '@/activities/emails/recipients/types/EmailRecipient';
import { getDisplayNameFromParticipant } from '@/activities/emails/utils/getDisplayNameFromParticipant';
import { BaseChip } from '@/object-record/record-field/ui/form-types/components/BaseChip';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

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

  const resolvedFullName = getDisplayNameFromParticipant({
    participant: {
      person,
      workspaceMember,
      displayName: '',
      handle: '',
    },
    shouldUseFullName: true,
  }).trim();

  // A resolved record can have an empty name; fall back to the parsed
  // display name before the raw address
  const resolvedLabel =
    [resolvedFullName, recipient.displayName ?? ''].find(isNonEmptyString) ??
    recipient.address;

  const avatar =
    isDefined(person) || isDefined(workspaceMember) ? (
      <Avatar
        avatarUrl={getAbsoluteImageUrl(
          person?.avatarUrl ?? workspaceMember?.avatarUrl,
        )}
        placeholder={resolvedLabel}
        placeholderColorSeed={person?.id ?? workspaceMember?.id}
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
              : formatEmailAddressWithDisplayName(recipient)
          }
          leftIcon={avatar}
          danger={isInvalid}
          selected={selected}
          isFlashing={isFlashing}
          onDoubleClick={onEdit}
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
