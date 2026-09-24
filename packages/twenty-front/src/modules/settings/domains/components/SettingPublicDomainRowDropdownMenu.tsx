import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { DropdownRootContent } from '@/ui/layout/dropdown/components/DropdownRootContent';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useMutation, useQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { Dropdown, LightIconButton, useToast } from 'twenty-ui/components';
import { IconDotsVertical, IconTrash } from 'twenty-ui/icon';
import {
  type PublicDomain,
  DeletePublicDomainDocument,
  FindManyPublicDomainsDocument,
} from '~/generated-metadata/graphql';

export const SettingPublicDomainRowDropdownMenu = ({
  publicDomain,
}: {
  publicDomain: PublicDomain;
}) => {
  const dropdownId = `settings-public-domain-row-${publicDomain.id}`;
  const { t } = useLingui();

  const { enqueueToast } = useToast();

  const { refetch: refetchPublicDomains } = useQuery(
    FindManyPublicDomainsDocument,
  );

  const [deletePublicDomain] = useMutation(DeletePublicDomainDocument);

  const handleDeletePublicDomain = async () => {
    try {
      await deletePublicDomain({
        variables: {
          domain: publicDomain.domain,
        },
      });

      enqueueToast({
        variant: 'success',
        children: t`Custom domain successfully deleted`,
      });

      await refetchPublicDomains();
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
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
            onClick={handleDeletePublicDomain}
          >{t`Delete`}</Dropdown.ActionItem>
        </Dropdown.Section>
      </DropdownRootContent>
    </DropdownRoot>
  );
};
