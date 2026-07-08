import { SettingsCard } from '@/settings/components/SettingsCard';
import { SettingsListCard } from '@/settings/components/SettingsListCard';
import { SettingPublicDomainRowDropdownMenu } from '@/settings/domains/components/SettingPublicDomainRowDropdownMenu';
import { selectedApplicationIdForPublicDomainState } from '@/settings/domains/states/selectedApplicationIdForPublicDomainState';
import { selectedPublicDomainState } from '@/settings/domains/states/selectedPublicDomainState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { Status } from 'twenty-ui/data-display';
import { IconWorld } from 'twenty-ui/icon';
import { useQuery } from '@apollo/client/react';
import {
  type PublicDomain,
  FindManyPublicDomainsDocument,
} from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { dateLocaleState } from '~/localization/states/dateLocaleState';
import { beautifyPastDateRelativeToNow } from '~/utils/date-utils';

export const SettingsPublicDomainsListCard = ({
  applicationId,
}: {
  applicationId: string;
}) => {
  const navigate = useNavigateSettings();

  const { t } = useLingui();
  const { localeCatalog } = useAtomStateValue(dateLocaleState);

  const setSelectedPublicDomain = useSetAtomState(selectedPublicDomainState);
  const setSelectedApplicationIdForPublicDomain = useSetAtomState(
    selectedApplicationIdForPublicDomainState,
  );

  const { data, loading } = useQuery(FindManyPublicDomainsDocument);

  const publicDomains = data?.findManyPublicDomains?.filter(
    (publicDomain) => publicDomain.applicationId === applicationId,
  );

  if (loading || !publicDomains) {
    return null;
  }

  const navigateToCreate = () => {
    setSelectedPublicDomain(undefined);
    setSelectedApplicationIdForPublicDomain(applicationId);
    navigate(SettingsPath.PublicDomain);
  };

  const getItemDescription = (createdAt: string) => {
    const beautifiedCreatedAt = beautifyPastDateRelativeToNow(
      createdAt,
      localeCatalog,
    );
    return t`Added ${beautifiedCreatedAt}`;
  };

  if (publicDomains.length === 0) {
    return (
      <SettingsCard
        title={t`Add Custom Domain`}
        Icon={<IconWorld />}
        onClick={navigateToCreate}
      />
    );
  }

  return (
    <SettingsListCard
      items={publicDomains}
      getItemLabel={({ domain }) => domain}
      getItemDescription={({ createdAt }) => getItemDescription(createdAt)}
      RowIcon={IconWorld}
      onRowClick={(publicDomain: PublicDomain) => {
        setSelectedPublicDomain(publicDomain);
        setSelectedApplicationIdForPublicDomain(applicationId);
        navigate(SettingsPath.PublicDomain);
      }}
      RowRightComponent={({ item: publicDomain }) => (
        <>
          {!publicDomain.isValidated && (
            <Status color="orange" text={t`Pending`} />
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
