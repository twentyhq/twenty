import {
  IconDotsVertical,
  IconEditCircle,
  IconTrash,
  LightIconButton,
  MenuItem,
} from 'twenty-ui';

import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { UnwrapRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared';
import { useDeleteWorkspaceTrustDomainMutation } from '~/generated/graphql';
import { workspaceTrustedDomainsState } from '@/settings/security/states/WorkspaceTrustedDomainsState';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { SettingsPath } from '@/types/SettingsPath';

type SettingsSecurityTrustedDomainRowDropdownMenuProps = {
  workspaceTrustedDomain: UnwrapRecoilValue<
    typeof workspaceTrustedDomainsState
  >[0];
};

export const SettingsSecurityTrustedDomainRowDropdownMenu = ({
  workspaceTrustedDomain,
}: SettingsSecurityTrustedDomainRowDropdownMenuProps) => {
  const navigate = useNavigateSettings();

  const dropdownId = `settings-account-row-${workspaceTrustedDomain.id}`;

  const { enqueueSnackBar } = useSnackBar();

  const { closeDropdown } = useDropdown(dropdownId);

  const [deleteWorkspaceTrustDomain] = useDeleteWorkspaceTrustDomainMutation();

  const handleDeleteWorkspaceTrustedDomain = async () => {
    const result = await deleteWorkspaceTrustDomain({
      variables: {
        input: {
          id: workspaceTrustedDomain.id,
        },
      },
    });
    if (isDefined(result.errors)) {
      enqueueSnackBar('Error deleting workspace trust domain', {
        variant: SnackBarVariant.Error,
        duration: 2000,
      });
    }
  };

  const handleEditWorkspaceTrustedDomain = () => {
    navigate(SettingsPath.EditTrustedDomain, {
      trustedDomainId: workspaceTrustedDomain.id,
    });
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
            accent="default"
            LeftIcon={IconEditCircle}
            text="Edit"
            onClick={() => {
              handleEditWorkspaceTrustedDomain();
              closeDropdown();
            }}
          />
          <MenuItem
            accent="danger"
            LeftIcon={IconTrash}
            text="Delete"
            onClick={() => {
              handleDeleteWorkspaceTrustedDomain();
              closeDropdown();
            }}
          />
        </DropdownMenuItemsContainer>
      }
    />
  );
};
