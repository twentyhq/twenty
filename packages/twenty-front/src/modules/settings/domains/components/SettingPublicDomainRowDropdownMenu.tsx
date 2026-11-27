import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useMutation, useQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { useToast } from 'twenty-ui/components/feedback';
import { LightIconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconDotsVertical, IconPin, IconTrash } from 'twenty-ui/icon';
import {
  type PublicDomain,
  DeletePublicDomainDocument,
  FindManyPublicDomainsDocument,
  FindOneApplicationDocument,
  SetApplicationPrimaryPublicDomainDocument,
} from '~/generated-metadata/graphql';

export const SettingPublicDomainRowDropdownMenu = ({
  publicDomain,
  applicationId,
  isPrimary,
}: {
  publicDomain: PublicDomain;
  applicationId: string;
  isPrimary: boolean;
}) => {
  const dropdownId = `settings-public-domain-row-${publicDomain.id}`;
  const { t } = useLingui();

  const { enqueueToast } = useToast();

  const { refetch: refetchPublicDomains } = useQuery(
    FindManyPublicDomainsDocument,
  );

  const [deletePublicDomain] = useMutation(DeletePublicDomainDocument, {
    refetchQueries: [FindOneApplicationDocument],
  });

  const [setApplicationPrimaryPublicDomain] = useMutation(
    SetApplicationPrimaryPublicDomainDocument,
    { refetchQueries: [FindOneApplicationDocument] },
  );

  const handleSetPrimaryPublicDomain = async () => {
    try {
      await setApplicationPrimaryPublicDomain({
        variables: { applicationId, publicDomainId: publicDomain.id },
      });

      enqueueToast({
        status: 'success',
        children: t`Primary domain updated`,
      });
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
    }
  };

  const handleDeletePublicDomain = async () => {
    try {
      await deletePublicDomain({
        variables: {
          domain: publicDomain.domain,
        },
      });

      enqueueToast({
        status: 'success',
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
      <DropdownContent side="right" align="start">
        <Dropdown.Section>
          {publicDomain.isValidated && !isPrimary && (
            <Dropdown.ActionItem
              startIcon={<IconPin />}
              onClick={handleSetPrimaryPublicDomain}
            >{t`Set as primary`}</Dropdown.ActionItem>
          )}
          <Dropdown.ActionItem
            color="danger"
            startIcon={<IconTrash />}
            onClick={handleDeletePublicDomain}
          >{t`Delete`}</Dropdown.ActionItem>
        </Dropdown.Section>
      </DropdownContent>
    </DropdownRoot>
  );
};
