import { isImpersonatingState } from '@/auth/states/isImpersonatingState';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { type WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import { t } from '@lingui/core/macro';
import { useRecoilValue } from 'recoil';
import { IconDotsVertical, IconSpy, IconTrash } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { MenuItem } from 'twenty-ui/navigation';
import { PermissionFlagType } from '~/generated/graphql';

type ManageMembersDropdownMenuProps = {
  dropdownId: string;
  workspaceMember: WorkspaceMember;
  onDelete: (workspaceMemberId: string) => void;
  onImpersonate: (workspaceMember: WorkspaceMember) => void;
};

export const ManageMembersDropdownMenu = ({
  dropdownId,
  workspaceMember,
  onDelete,
  onImpersonate,
}: ManageMembersDropdownMenuProps) => {
  const { closeDropdown } = useCloseDropdown();
  const isImpersonating = useRecoilValue(isImpersonatingState);
  const canImpersonate =
    useHasPermissionFlag(PermissionFlagType.IMPERSONATE) && !isImpersonating;

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
                LeftIcon={IconSpy}
                text={t`Impersonate`}
                onClick={() => {
                  onImpersonate(workspaceMember);
                  closeDropdown(dropdownId);
                }}
              />
            )}
            <MenuItem
              accent="danger"
              LeftIcon={IconTrash}
              text={t`Delete`}
              onClick={() => {
                onDelete(workspaceMember.id);
                closeDropdown(dropdownId);
              }}
            />
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
    />
  );
};
