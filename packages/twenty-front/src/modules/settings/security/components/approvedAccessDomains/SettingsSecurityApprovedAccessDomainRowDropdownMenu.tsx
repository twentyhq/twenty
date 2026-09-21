import { ListItem } from 'twenty-ui/primitives/navigation';
import { approvedAccessDomainsState } from '@/settings/security/states/ApprovedAccessDomainsState';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconDotsVertical, IconTrash } from 'twenty-ui/icon';
import { useToast } from 'twenty-ui/primitives/feedback';
import { LightIconButton } from 'twenty-ui/components';
import {
  type ApprovedAccessDomain,
  DeleteApprovedAccessDomainDocument,
} from '~/generated-metadata/graphql';

type SettingsSecurityApprovedAccessDomainRowDropdownMenuProps = {
  approvedAccessDomain: Omit<ApprovedAccessDomain, '__typename'>;
};

export const SettingsSecurityApprovedAccessDomainRowDropdownMenu = ({
  approvedAccessDomain,
}: SettingsSecurityApprovedAccessDomainRowDropdownMenuProps) => {
  const dropdownId = `settings-approved-access-domain-row-${approvedAccessDomain.id}`;

  const setApprovedAccessDomains = useSetAtomState(approvedAccessDomainsState);

  const { enqueueToast } = useToast();

  const { closeDropdown } = useCloseDropdown();

  const [deleteApprovedAccessDomain] = useMutation(
    DeleteApprovedAccessDomainDocument,
  );

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
    if (isDefined(result.error)) {
      enqueueToast({
        variant: 'error',
        children: t`Could not delete approved access domain`,
        duration: 2000,
      });
    }
  };

  return (
    <Dropdown
      dropdownId={dropdownId}
      dropdownPlacement="right-start"
      clickableComponent={
        <LightIconButton emphasis="subtle" aria-label={t`More options`}>
          <IconDotsVertical />
        </LightIconButton>
      }
      dropdownComponents={
        <DropdownContent>
          <DropdownMenuItemsContainer>
            <ListItem
              color="danger"
              startIcon={<IconTrash />}
              onClick={() => {
                handleDeleteApprovedAccessDomain();
                closeDropdown(dropdownId);
              }}
            >
              {'Delete'}
            </ListItem>
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
    />
  );
};
