import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { t } from '@lingui/core/macro';
import { IconDotsVertical, IconTrash, IconUser } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { MenuItem } from 'twenty-ui/navigation';
import { PermissionFlagType } from '~/generated/graphql';

type ManageMembersDropdownMenuProps = {
  dropdownId: string;
  workspaceMemberId: string;
  onDelete: (workspaceMemberId: string) => void;
  onImpersonate: (workspaceMemberId: string) => void;
};

export const ManageMembersDropdownMenu = ({
  dropdownId,
  workspaceMemberId,
  onDelete,
  onImpersonate,
}: ManageMembersDropdownMenuProps) => {
  const { closeDropdown } = useCloseDropdown();
  const canImpersonate = useHasPermissionFlag(PermissionFlagType.IMPERSONATE);

  return (
    <Dropdown
      dropdownId={dropdownId}
      dropdownPlacement="right-start"
      clickableComponent={
        <LightIconButton Icon={IconDotsVertical} accent="tertiary" />
      }
      dropdownComponents={
        <DropdownContent>
          <DropdownMenuItemsContainer>
            {canImpersonate && (
              <MenuItem
                LeftIcon={IconUser}
                text={t`Impersonate`}
                onClick={() => {
                  onImpersonate(workspaceMemberId);
                  closeDropdown(dropdownId);
                }}
              />
            )}
            <MenuItem
              accent="danger"
              LeftIcon={IconTrash}
              text={t`Delete`}
              onClick={() => {
                onDelete(workspaceMemberId);
                closeDropdown(dropdownId);
              }}
            />
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
    />
  );
};
