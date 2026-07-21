import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconCopy, IconPencil, IconTrash, IconUserPlus } from 'twenty-ui/icon';
import { MenuItem, MenuItemAvatar } from 'twenty-ui/navigation';

import { type EmailRecipientResolution } from '@/activities/emails/recipients/hooks/useEmailRecipientsResolution';
import { type EmailRecipient } from '@/activities/emails/recipients/types/EmailRecipient';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

type EmailRecipientChipMenuContentProps = {
  dropdownId: string;
  recipient: EmailRecipient;
  resolution: EmailRecipientResolution | undefined;
  isInvalid: boolean;
  onEdit: () => void;
  onRemove: () => void;
};

export const EmailRecipientChipMenuContent = ({
  dropdownId,
  recipient,
  resolution,
  isInvalid,
  onEdit,
  onRemove,
}: EmailRecipientChipMenuContentProps) => {
  const { t } = useLingui();
  const { closeDropdown } = useCloseDropdown();
  const { copyToClipboard } = useCopyToClipboard();
  const { enqueueSuccessSnackBar } = useSnackBar();

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
    closeDropdown(dropdownId);

    const [firstName = '', ...lastNameParts] = (
      recipient.displayName ?? ''
    ).split(' ');

    const createdPerson = await createPerson({
      emails: { primaryEmail: recipient.address, additionalEmails: [] },
      name: { firstName, lastName: lastNameParts.join(' ') },
    });

    if (isDefined(createdPerson)) {
      enqueueSuccessSnackBar({ message: t`Person created` });
    }
  };

  const handleCopy = () => {
    closeDropdown(dropdownId);
    copyToClipboard(recipient.address, t`Email copied to clipboard`);
  };

  const handleEdit = () => {
    closeDropdown(dropdownId);
    onEdit();
  };

  const handleRemove = () => {
    closeDropdown(dropdownId);
    onRemove();
  };

  const showAddAsPerson =
    !isDefined(person) && !isDefined(workspaceMember) && !isInvalid;

  return (
    <DropdownContent widthInPixels={280}>
      {(isDefined(person) || isDefined(workspaceMember) || showAddAsPerson) && (
        <>
          <DropdownMenuItemsContainer>
            {isDefined(workspaceMember) ? (
              <MenuItemAvatar
                avatar={{
                  avatarUrl: getAbsoluteImageUrl(workspaceMember.avatarUrl),
                  placeholder: isNonEmptyString(workspaceMemberFullName)
                    ? workspaceMemberFullName
                    : recipient.address,
                  placeholderColorSeed: workspaceMember.id,
                  size: 'md',
                  type: 'rounded',
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
                  avatarUrl: getAbsoluteImageUrl(person.avatarUrl),
                  placeholder: isNonEmptyString(personFullName)
                    ? personFullName
                    : recipient.address,
                  placeholderColorSeed: person.id,
                  size: 'md',
                  type: 'rounded',
                }}
                text={
                  isNonEmptyString(personFullName)
                    ? personFullName
                    : recipient.address
                }
                contextualText={recipient.address}
              />
            ) : (
              <MenuItem
                LeftIcon={IconUserPlus}
                text={t`Add as person`}
                onClick={handleAddAsPerson}
              />
            )}
          </DropdownMenuItemsContainer>
          <DropdownMenuSeparator />
        </>
      )}
      <DropdownMenuItemsContainer>
        <MenuItem
          LeftIcon={IconCopy}
          text={t`Copy email`}
          onClick={handleCopy}
        />
        <MenuItem LeftIcon={IconPencil} text={t`Edit`} onClick={handleEdit} />
        <MenuItem
          accent="danger"
          LeftIcon={IconTrash}
          text={t`Remove`}
          onClick={handleRemove}
        />
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
