import { approvedAccessDomainsState } from '@/settings/security/states/ApprovedAccessDomainsState';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
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
import { Menu } from 'twenty-ui/primitives/surfaces';

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
    <DropdownMenu
      dropdownId={dropdownId}
      dropdownPlacement="right-start"
      clickableComponent={
        <LightIconButton emphasis="subtle" aria-label={t`More options`}>
          <IconDotsVertical />
        </LightIconButton>
      }
      dropdownComponents={
        <DropdownContent>
          <Menu.Group>
            <Menu.Item
              color="danger"
              startIcon={<IconTrash />}
              onClick={() => {
                handleDeleteApprovedAccessDomain();
                closeDropdown(dropdownId);
              }}
            >
              {'Delete'}
            </Menu.Item>
          </Menu.Group>
        </DropdownContent>
      }
    />
  );
};
