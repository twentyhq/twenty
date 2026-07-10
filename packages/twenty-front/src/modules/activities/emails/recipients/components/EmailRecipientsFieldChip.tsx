import { useLingui } from '@lingui/react/macro';
import { formatEmailAddressWithDisplayName } from 'twenty-shared/utils';
import { Avatar } from 'twenty-ui/data-display';

import { EmailRecipientChipMenuContent } from '@/activities/emails/recipients/components/EmailRecipientChipMenuContent';
import { type EmailRecipientResolution } from '@/activities/emails/recipients/hooks/useEmailRecipientsResolution';
import { type EmailRecipient } from '@/activities/emails/recipients/types/EmailRecipient';
import { getEmailRecipientIdentity } from '@/activities/emails/recipients/utils/getEmailRecipientIdentity';
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

  const identity = getEmailRecipientIdentity({ recipient, resolution });

  const avatar =
    identity.kind !== 'unknown' ? (
      <Avatar
        avatarUrl={getAbsoluteImageUrl(identity.resolvedRecord.avatarUrl)}
        placeholder={identity.label}
        placeholderColorSeed={identity.resolvedRecord.id}
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
          label={identity.label}
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
