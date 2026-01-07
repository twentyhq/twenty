import { SettingsCard } from '@/settings/components/SettingsCard';
import { SettingsListCard } from '@/settings/components/SettingsListCard';
import { SettingPublicDomainRowDropdownMenu } from '@/settings/domains/components/SettingPublicDomainRowDropdownMenu';
import { selectedPublicDomainState } from '@/settings/domains/states/selectedPublicDomainState';
import { useLingui } from '@lingui/react/macro';
import { useSetRecoilState } from 'recoil';
import { SettingsPath } from 'twenty-shared/types';
import { IconAt, IconMailCog, Status } from 'twenty-ui/display';
import { useFindManyPublicDomainsQuery } from '~/generated-metadata/graphql';
import { type PublicDomain } from '~/generated/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const SettingsPublicDomainsListCard = () => {
  const navigate = useNavigateSettings();

  const { t } = useLingui();

  const setSelectedPublicDomain = useSetRecoilState(selectedPublicDomainState);

  const { data, loading } = useFindManyPublicDomainsQuery();

  const publicDomains = data?.findManyPublicDomains;

  if (loading || !publicDomains) {
    return null;
  }

  if (publicDomains.length === 0) {
    return (
      <SettingsCard
        title={t`Add Public Domain`}
        Icon={<IconMailCog />}
        onClick={() => {
          setSelectedPublicDomain(undefined);
          navigate(SettingsPath.PublicDomain);
        }}
      />
    );
  }

  return (
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
            <Status color="orange" text={t`Pending`} />
          )}
          <SettingPublicDomainRowDropdownMenu publicDomain={publicDomain} />
        </>
      )}
      hasFooter
      footerButtonLabel={t`Add Public Domain`}
      onFooterButtonClick={() => {
        setSelectedPublicDomain(undefined);
        navigate(SettingsPath.PublicDomain);
      }}
    />
  );
};
