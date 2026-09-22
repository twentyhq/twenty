import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useMutation, useQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { IconDotsVertical, IconTrash } from 'twenty-ui/icon';
import { useToast } from 'twenty-ui/primitives/feedback';
import { LightIconButton } from 'twenty-ui/components';
import {
  type PublicDomain,
  DeletePublicDomainDocument,
  FindManyPublicDomainsDocument,
} from '~/generated-metadata/graphql';
import { Menu } from 'twenty-ui/primitives/surfaces';

export const SettingPublicDomainRowDropdownMenu = ({
  publicDomain,
}: {
  publicDomain: PublicDomain;
}) => {
  const dropdownId = `settings-public-domain-row-${publicDomain.id}`;
  const { t } = useLingui();

  const { enqueueToast } = useToast();

  const { closeDropdown } = useCloseDropdown();

  const { refetch: refetchPublicDomains } = useQuery(
    FindManyPublicDomainsDocument,
  );

  const [deletePublicDomain] = useMutation(DeletePublicDomainDocument);

  const handleDeletePublicDomain = async () => {
    await deletePublicDomain({
      variables: {
        domain: publicDomain.domain,
      },
      onCompleted: () =>
        enqueueToast({
          variant: 'success',
          children: t`Custom domain successfully deleted`,
        }),
      onError: (error) => enqueueToast(getToastOptionsFromError({ error })),
    });
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
              onClick={async () => {
                await handleDeletePublicDomain();
                closeDropdown(dropdownId);
                await refetchPublicDomains();
              }}
            >{t`Delete`}</Menu.Item>
          </Menu.Group>
        </DropdownContent>
      }
    />
  );
};
