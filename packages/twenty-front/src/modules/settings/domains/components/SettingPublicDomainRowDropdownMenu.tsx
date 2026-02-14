import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useLingui } from '@lingui/react/macro';
import { IconDotsVertical, IconTrash } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { MenuItem } from 'twenty-ui/navigation';
import {
  useDeletePublicDomainMutation,
  useFindManyPublicDomainsQuery,
  type PublicDomain,
} from '~/generated-metadata/graphql';

export const SettingPublicDomainRowDropdownMenu = ({
  publicDomain,
}: {
  publicDomain: PublicDomain;
}) => {
  const dropdownId = `settings-public-domain-row-${publicDomain.id}`;
  const { t } = useLingui();

  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();

  const { closeDropdown } = useCloseDropdown();

  const { refetch: refetchPublicDomains } = useFindManyPublicDomainsQuery();

  const [deletePublicDomain] = useDeletePublicDomainMutation();

  const handleDeletePublicDomain = async () => {
    await deletePublicDomain({
      variables: {
        domain: publicDomain.domain,
      },
      onCompleted: () =>
        enqueueSuccessSnackBar({
          message: t`Public domain successfully deleted`,
        }),
      onError: (error) => enqueueErrorSnackBar({ apolloError: error }),
    });
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
              onClick={async () => {
                await handleDeletePublicDomain();
                closeDropdown(dropdownId);
                await refetchPublicDomains();
              }}
            />
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
    />
  );
};
