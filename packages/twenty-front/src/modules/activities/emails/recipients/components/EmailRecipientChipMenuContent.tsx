import { type EmailRecipientResolution } from '@/activities/emails/recipients/hooks/useEmailRecipientsResolution';
import { type EmailRecipient } from '@/activities/emails/recipients/types/EmailRecipient';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Dropdown, MenuItemAvatar, useToast } from 'twenty-ui/components';
import { IconCopy, IconPencil, IconTrash, IconUserPlus } from 'twenty-ui/icon';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

type EmailRecipientChipMenuContentProps = {
  recipient: EmailRecipient;
  resolution: EmailRecipientResolution | undefined;
  isInvalid: boolean;
  onEdit: () => void;
  onRemove: () => void;
};

export const EmailRecipientChipMenuContent = ({
  recipient,
  resolution,
  isInvalid,
  onEdit,
  onRemove,
}: EmailRecipientChipMenuContentProps) => {
  const { t } = useLingui();
  const { copyToClipboard } = useCopyToClipboard();
  const { enqueueToast } = useToast();

  const { createOneRecord: createPerson } = useCreateOneRecord({
    objectNameSingular: CoreObjectNameSingular.Person,
  });

  const workspaceMember = resolution?.workspaceMember;
  const person = resolution?.person;

  const workspaceMemberFullName = isDefined(workspaceMember)
    ? `${workspaceMember.name.firstName} ${workspaceMember.name.lastName}`.trim()
    : '';
  const personFullName = isDefined(person)
    ? `${person.firstName} ${person.lastName}`.trim()
    : '';

  const handleAddAsPerson = async () => {
    const [firstName = '', ...lastNameParts] = (
      recipient.displayName ?? ''
    ).split(' ');

    const createdPerson = await createPerson({
      emails: { primaryEmail: recipient.address, additionalEmails: [] },
      name: { firstName, lastName: lastNameParts.join(' ') },
    });

    if (isDefined(createdPerson)) {
      enqueueToast({ variant: 'success', children: t`Person created` });
    }
  };

  const handleCopy = () => {
    copyToClipboard(recipient.address, t`Email copied to clipboard`);
  };

  const showAddAsPerson =
    !isDefined(person) && !isDefined(workspaceMember) && !isInvalid;

  return (
    <>
      {(isDefined(person) || isDefined(workspaceMember) || showAddAsPerson) && (
        <>
          <Dropdown.Section>
            {isDefined(workspaceMember) ? (
              <MenuItemAvatar
                avatar={{
                  src: getAbsoluteImageUrl(workspaceMember.avatarUrl),
                  name: isNonEmptyString(workspaceMemberFullName)
                    ? workspaceMemberFullName
                    : recipient.address,
                  colorSeed: workspaceMember.id,
                  size: 'md',
                  shape: 'circle',
                }}
                text={
                  isNonEmptyString(workspaceMemberFullName)
                    ? workspaceMemberFullName
                    : recipient.address
                }
                contextualText={t`Team member`}
              />
            ) : isDefined(person) ? (
              <MenuItemAvatar
                avatar={{
                  src: getAbsoluteImageUrl(person.avatarUrl),
                  name: isNonEmptyString(personFullName)
                    ? personFullName
                    : recipient.address,
                  colorSeed: person.id,
                  size: 'md',
                  shape: 'circle',
                }}
                text={
                  isNonEmptyString(personFullName)
                    ? personFullName
                    : recipient.address
                }
                contextualText={recipient.address}
              />
            ) : (
              <Dropdown.ActionItem
                startIcon={<IconUserPlus />}
                onClick={handleAddAsPerson}
              >{t`Add as person`}</Dropdown.ActionItem>
            )}
          </Dropdown.Section>
          <Dropdown.Separator />
        </>
      )}
      <Dropdown.Section>
        <Dropdown.ActionItem
          startIcon={<IconCopy />}
          onClick={handleCopy}
        >{t`Copy email`}</Dropdown.ActionItem>
        <Dropdown.ActionItem
          startIcon={<IconPencil />}
          onClick={onEdit}
        >{t`Edit`}</Dropdown.ActionItem>
        <Dropdown.ActionItem
          color="danger"
          startIcon={<IconTrash />}
          onClick={onRemove}
        >{t`Remove`}</Dropdown.ActionItem>
      </Dropdown.Section>
    </>
  );
};
