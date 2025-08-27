import { approvedAccessDomainsState } from '@/settings/security/states/ApprovedAccessDomainsState';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { t } from '@lingui/core/macro';
import { type UnwrapRecoilValue, useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { IconDotsVertical, IconTrash } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { MenuItem } from 'twenty-ui/navigation';
import { useDeleteApprovedAccessDomainMutation } from '~/generated-metadata/graphql';

type SettingsSecurityApprovedAccessDomainRowDropdownMenuProps = {
  approvedAccessDomain: UnwrapRecoilValue<typeof approvedAccessDomainsState>[0];
};

export const SettingsSecurityApprovedAccessDomainRowDropdownMenu = ({
  approvedAccessDomain,
}: SettingsSecurityApprovedAccessDomainRowDropdownMenuProps) => {
  const dropdownId = `settings-approved-access-domain-row-${approvedAccessDomain.id}`;

  const setApprovedAccessDomains = useSetRecoilState(
    approvedAccessDomainsState,
  );

  const { enqueueErrorSnackBar } = useSnackBar();

  const { closeDropdown } = useCloseDropdown();

  const [deleteApprovedAccessDomain] = useDeleteApprovedAccessDomainMutation();

  const handleDeleteApprovedAccessDomain = async () => {
    const result = await deleteApprovedAccessDomain({
      variables: {
        input: {
          id: approvedAccessDomain.id,
        },
      },
      onCompleted: () => {
        setApprovedAccessDomains((approvedAccessDomains) => {
          return approvedAccessDomains.filter(
            ({ id }) => id !== approvedAccessDomain.id,
          );
        });
      },
    });
    if (isDefined(result.errors)) {
      enqueueErrorSnackBar({
        message: t`Could not delete approved access domain`,
        options: {
          duration: 2000,
        },
      });
    }
  };

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
            <MenuItem
              accent="danger"
              LeftIcon={IconTrash}
              text="Delete"
              onClick={() => {
                handleDeleteApprovedAccessDomain();
                closeDropdown(dropdownId);
              }}
            />
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
    />
  );
};
