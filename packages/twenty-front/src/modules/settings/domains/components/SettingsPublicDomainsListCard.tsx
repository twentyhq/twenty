import { SettingsCard } from '@/settings/components/SettingsCard';
import { SettingsListCard } from '@/settings/components/SettingsListCard';
import { SettingPublicDomainRowDropdownMenu } from '@/settings/domains/components/SettingPublicDomainRowDropdownMenu';
import { useGetAddedRelativeDateDescription } from '@/settings/hooks/useGetAddedRelativeDateDescription';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { Status } from 'twenty-ui/primitives/data-display';
import { IconWorld } from 'twenty-ui/icon';
import { useQuery } from '@apollo/client/react';
import {
  type PublicDomain,
  FindManyPublicDomainsDocument,
} from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const SettingsPublicDomainsListCard = ({
  applicationId,
}: {
  applicationId: string;
}) => {
  const navigate = useNavigateSettings();

  const { t } = useLingui();
  const { getAddedRelativeDateDescription } =
    useGetAddedRelativeDateDescription();

  const { data, loading } = useQuery(FindManyPublicDomainsDocument);

  const publicDomains = data?.findManyPublicDomains?.filter(
    (publicDomain) => publicDomain.applicationId === applicationId,
  );

  if (loading || !publicDomains) {
    return null;
  }

  // The empty-state card and the footer button are plain buttons, they cannot
  // carry a Link.
  // oxlint-disable-next-line twenty/no-navigate-prefer-link
  const navigateToCreate = () =>
    navigate(SettingsPath.ApplicationPublicDomainNew, { applicationId });

  if (publicDomains.length === 0) {
    return (
      <SettingsCard
        title={t`Add Custom Domain`}
        Icon={<IconWorld />}
        // oxlint-disable-next-line twenty/no-navigate-prefer-link
        onClick={navigateToCreate}
      />
    );
  }

  return (
    <SettingsListCard
      items={publicDomains}
      getItemLabel={({ domain }) => domain}
      getItemDescription={({ createdAt }) =>
        getAddedRelativeDateDescription(createdAt)
      }
      RowIcon={IconWorld}
      to={(publicDomain: PublicDomain) =>
        getSettingsPath(SettingsPath.ApplicationPublicDomainDetail, {
          applicationId,
          publicDomainId: publicDomain.id,
        })
      }
      RowRightComponent={({ item: publicDomain }) => (
        <>
          {!publicDomain.isValidated && (
            <Status color="orange">{t`Pending`}</Status>
          )}
          <SettingPublicDomainRowDropdownMenu publicDomain={publicDomain} />
        </>
      )}
      hasFooter
      footerButtonLabel={t`Add Custom Domain`}
      onFooterButtonClick={navigateToCreate}
    />
  );
};
