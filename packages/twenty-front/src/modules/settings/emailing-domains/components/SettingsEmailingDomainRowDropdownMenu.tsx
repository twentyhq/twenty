import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { ApolloError } from '@apollo/client';
import { t } from '@lingui/core/macro';
import { IconDotsVertical, IconTrash } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { MenuItem } from 'twenty-ui/navigation';
import {
  type GetEmailingDomainsQuery,
  useDeleteEmailingDomainMutation,
  useGetEmailingDomainsQuery,
} from '~/generated-metadata/graphql';

type SettingsEmailingDomainRowDropdownMenuProps = {
  emailingDomain: GetEmailingDomainsQuery['getEmailingDomains'][0];
};

export const SettingsEmailingDomainRowDropdownMenu = ({
  emailingDomain,
}: SettingsEmailingDomainRowDropdownMenuProps) => {
  const dropdownId = `settings-emailing-domain-row-${emailingDomain.id}`;

  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();

  const { closeDropdown } = useCloseDropdown();

  const { refetch: refetchEmailingDomains } = useGetEmailingDomainsQuery();

  const [deleteEmailingDomainMutation] = useDeleteEmailingDomainMutation();

  const handleDeleteEmailingDomain = async () => {
    try {
      await deleteEmailingDomainMutation({
        variables: {
          id: emailingDomain.id,
        },
      });

      enqueueSuccessSnackBar({
        message: t`Emailing domain deleted successfully`,
      });

      await refetchEmailingDomains();
    } catch (error) {
      enqueueErrorSnackBar({
        ...(error instanceof ApolloError ? { apolloError: error } : {}),
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
              text={t`Delete`}
              onClick={() => {
                handleDeleteEmailingDomain();
                closeDropdown(dropdownId);
              }}
            />
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
    />
  );
};
