import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/surfaces';
import { getDropdownMenuItemClickHandler } from '@/ui/layout/dropdown/utils/getDropdownMenuItemClickHandler';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconCopy, IconPencil, IconTrash, IconUserPlus } from 'twenty-ui/icon';
import { ListItem, MenuItemAvatar } from 'twenty-ui/primitives/navigation';

import { type EmailRecipientResolution } from '@/activities/emails/recipients/hooks/useEmailRecipientsResolution';
import { type EmailRecipient } from '@/activities/emails/recipients/types/EmailRecipient';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useToast } from 'twenty-ui/primitives/feedback';
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
    closeDropdown(dropdownId);

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
              <ListItem
                startIcon={<IconUserPlus />}
                onClick={getDropdownMenuItemClickHandler(handleAddAsPerson)}
              >
                <OverflowingTextWithTooltip text={t`Add as person`} />
              </ListItem>
            )}
          </DropdownMenuItemsContainer>
          <DropdownMenuSeparator />
        </>
      )}
      <DropdownMenuItemsContainer>
        <ListItem
          startIcon={<IconCopy />}
          onClick={getDropdownMenuItemClickHandler(handleCopy)}
        >
          <OverflowingTextWithTooltip text={t`Copy email`} />
        </ListItem>
        <ListItem
          startIcon={<IconPencil />}
          onClick={getDropdownMenuItemClickHandler(handleEdit)}
        >
          <OverflowingTextWithTooltip text={t`Edit`} />
        </ListItem>
        <ListItem
          color="danger"
          startIcon={<IconTrash />}
          onClick={getDropdownMenuItemClickHandler(handleRemove)}
        >
          <OverflowingTextWithTooltip text={t`Remove`} />
        </ListItem>
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
