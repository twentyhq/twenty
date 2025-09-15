import { SettingsPath } from 'twenty-shared/types';
import { IconAt, Status } from 'twenty-ui/display';
import { useFindManyPublicDomainsQuery } from '~/generated-metadata/graphql';
import { SettingsListCard } from '@/settings/components/SettingsListCard';
import { type PublicDomain } from '~/generated/graphql';
import { SettingPublicDomainRowDropdownMenu } from '@/settings/domains/components/SettingPublicDomainRowDropdownMenu';
import { selectedPublicDomainState } from '@/settings/domains/states/selectedPublicDomainState';
import { useSetRecoilState } from 'recoil';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const SettingsPublicDomainsListCard = () => {
  const navigate = useNavigateSettings();

  const setSelectedPublicDomain = useSetRecoilState(selectedPublicDomainState);

  const { data, loading } = useFindManyPublicDomainsQuery();

  const publicDomains = data?.findManyPublicDomains;

  return (
    !loading &&
    publicDomains && (
      <SettingsListCard
        items={publicDomains}
        getItemLabel={({ domain }) => domain}
        getItemDescription={({ createdAt }) => createdAt}
        RowIcon={IconAt}
        onRowClick={(publicDomain: PublicDomain) => {
          setSelectedPublicDomain(publicDomain);
          navigate(SettingsPath.PublicDomain);
        }}
        RowRightComponent={({ item: publicDomain }) => (
          <>
            {!publicDomain.isValidated && (
              <Status color="orange" text="Pending" />
            )}
            <SettingPublicDomainRowDropdownMenu publicDomain={publicDomain} />
          </>
        )}
        hasFooter
        footerButtonLabel="Add Public Domain"
        onFooterButtonClick={() => {
          setSelectedPublicDomain(undefined);
          navigate(SettingsPath.PublicDomain);
        }}
      />
    )
  );
};
