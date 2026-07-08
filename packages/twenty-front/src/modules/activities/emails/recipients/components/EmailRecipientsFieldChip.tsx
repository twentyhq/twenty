import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Avatar } from 'twenty-ui/data-display';
import { IconCopy, IconPencil, IconTrash, IconUserPlus } from 'twenty-ui/icon';
import { MenuItem, MenuItemAvatar } from 'twenty-ui/navigation';

import { EmailRecipientChip } from '@/activities/emails/recipients/components/EmailRecipientChip';
import { type EmailRecipientResolution } from '@/activities/emails/recipients/hooks/useEmailRecipientsResolution';
import { type EmailRecipient } from '@/activities/emails/recipients/types/EmailRecipient';
import { formatEmailRecipient } from '@/activities/emails/recipients/utils/formatEmailRecipient';
import { isValidEmailRecipientAddress } from '@/activities/emails/recipients/utils/isValidEmailRecipientAddress';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

type EmailRecipientsFieldChipProps = {
  chipId: string;
  dropdownId: string;
  recipient: EmailRecipient;
  resolution: EmailRecipientResolution | undefined;
  selected: boolean;
  isFlashing: boolean;
  onFlashEnd: () => void;
  onEdit: () => void;
  onRemove: () => void;
};

export const EmailRecipientsFieldChip = ({
  chipId,
  dropdownId,
  recipient,
  resolution,
  selected,
  isFlashing,
  onFlashEnd,
  onEdit,
  onRemove,
}: EmailRecipientsFieldChipProps) => {
  const { t } = useLingui();
  const { closeDropdown } = useCloseDropdown();
  const { copyToClipboard } = useCopyToClipboard();
  const { enqueueSuccessSnackBar } = useSnackBar();

  const { createOneRecord: createPerson } = useCreateOneRecord({
    objectNameSingular: CoreObjectNameSingular.Person,
  });

  const isInvalid = !isValidEmailRecipientAddress(recipient.address);

  const workspaceMember = resolution?.workspaceMember;
  const person = resolution?.person;

  const workspaceMemberFullName = isDefined(workspaceMember)
    ? `${workspaceMember.name.firstName} ${workspaceMember.name.lastName}`.trim()
    : '';
  const personFullName = isDefined(person)
    ? `${person.firstName} ${person.lastName}`.trim()
    : '';

  const resolvedLabel =
    [workspaceMemberFullName, personFullName, recipient.displayName ?? ''].find(
      isNonEmptyString,
    ) ?? recipient.address;

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
    <Dropdown
      dropdownId={dropdownId}
      dropdownPlacement="bottom-start"
      clickableComponent={
        <EmailRecipientChip
          chipId={chipId}
          label={resolvedLabel}
          title={
            isInvalid
              ? t`Invalid email address`
              : formatEmailRecipient(recipient)
          }
          leftComponent={avatar}
          danger={isInvalid}
          selected={selected}
          isFlashing={isFlashing}
          onFlashEnd={onFlashEnd}
          onDoubleClick={onEdit}
          onRemove={(event) => {
            event.stopPropagation();
            handleRemove();
          }}
          removeAriaLabel={t`Remove recipient`}
        />
      }
      dropdownComponents={
        <DropdownContent widthInPixels={280}>
          {(isDefined(person) ||
            isDefined(workspaceMember) ||
            showAddAsPerson) && (
            <>
              <DropdownMenuItemsContainer>
                {isDefined(person) ? (
                  <MenuItemAvatar
                    avatar={{
                      avatarUrl: getAbsoluteImageUrl(person.avatarUrl),
                      placeholder: resolvedLabel,
                      placeholderColorSeed: person.id,
                      size: 'md',
                      type: 'rounded',
                    }}
                    text={resolvedLabel}
                    contextualText={recipient.address}
                  />
                ) : isDefined(workspaceMember) ? (
                  <MenuItemAvatar
                    avatar={{
                      avatarUrl: getAbsoluteImageUrl(workspaceMember.avatarUrl),
                      placeholder: resolvedLabel,
                      placeholderColorSeed: workspaceMember.id,
                      size: 'md',
                      type: 'rounded',
                    }}
                    text={resolvedLabel}
                    contextualText={t`Team member`}
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
            <MenuItem
              LeftIcon={IconPencil}
              text={t`Edit`}
              onClick={handleEdit}
            />
            <MenuItem
              accent="danger"
              LeftIcon={IconTrash}
              text={t`Remove`}
              onClick={handleRemove}
            />
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
    />
  );
};
