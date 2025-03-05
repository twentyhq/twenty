import {
  IconDotsVertical,
  IconTrash,
  LightIconButton,
  MenuItem,
} from 'twenty-ui';

import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { UnwrapRecoilValue, useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared';
import { useDeleteApprovedAccessDomainMutation } from '~/generated/graphql';
import { approvedAccessDomainsState } from '@/settings/security/states/ApprovedAccessDomainsState';

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

  const { enqueueSnackBar } = useSnackBar();

  const { closeDropdown } = useDropdown(dropdownId);

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
      enqueueSnackBar('Error deleting approved access domain', {
        variant: SnackBarVariant.Error,
        duration: 2000,
      });
    }
  };

  return (
    <Dropdown
      dropdownId={dropdownId}
      dropdownPlacement="right-start"
      dropdownHotkeyScope={{ scope: dropdownId }}
      clickableComponent={
        <LightIconButton Icon={IconDotsVertical} accent="tertiary" />
      }
      dropdownMenuWidth={160}
      dropdownComponents={
        <DropdownMenuItemsContainer>
          <MenuItem
            accent="danger"
            LeftIcon={IconTrash}
            text="Delete"
            onClick={() => {
              handleDeleteApprovedAccessDomain();
              closeDropdown();
            }}
          />
        </DropdownMenuItemsContainer>
      }
    />
  );
};
