import { SettingsPath } from 'twenty-shared/types';
import { IconAt, IconMailCog, Status } from 'twenty-ui/display';
import { useFindManyPublicDomainsQuery } from '~/generated-metadata/graphql';
import { SettingsListCard } from '@/settings/components/SettingsListCard';
import { type PublicDomain } from '~/generated/graphql';
import { SettingPublicDomainRowDropdownMenu } from '@/settings/domains/components/SettingPublicDomainRowDropdownMenu';
import { selectedPublicDomainState } from '@/settings/domains/states/selectedPublicDomainState';
import { useSetRecoilState } from 'recoil';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { getSettingsPath } from 'twenty-shared/utils';
import { SettingsCard } from '@/settings/components/SettingsCard';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { Link } from 'react-router-dom';
import styled from '@emotion/styled';

const StyledLink = styled(Link)`
  text-decoration: none;
`;

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
    setSelectedPublicDomain(undefined);
    return (
      <StyledLink to={getSettingsPath(SettingsPath.PublicDomain)}>
        <SettingsCard title={t`Add Public Domain`} Icon={<IconMailCog />} />
      </StyledLink>
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
