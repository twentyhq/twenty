import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { DropdownRootContent } from '@/ui/layout/dropdown/components/DropdownRootContent';
import { approvedAccessDomainsState } from '@/settings/security/states/ApprovedAccessDomainsState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { Dropdown, LightIconButton, useToast } from 'twenty-ui/components';
import { IconDotsVertical, IconTrash } from 'twenty-ui/icon';
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
    <DropdownRoot type="menu" dropdownId={dropdownId}>
      <Dropdown.Trigger
        render={
          <LightIconButton emphasis="subtle" aria-label={t`More options`}>
            <IconDotsVertical />
          </LightIconButton>
        }
      />
      <DropdownRootContent side="right" align="start">
        <Dropdown.Section>
          <Dropdown.ActionItem
            color="danger"
            startIcon={<IconTrash />}
            onClick={handleDeleteApprovedAccessDomain}
          >
            {t`Delete`}
          </Dropdown.ActionItem>
        </Dropdown.Section>
      </DropdownRootContent>
    </DropdownRoot>
  );
};
