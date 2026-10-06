/* @license Enterprise */

import { ToastOnQueryErrorEffect } from '@/apollo/components/ToastOnQueryErrorEffect';
import { Link } from 'react-router-dom';

import { SettingsPath } from 'twenty-shared/types';

import { SettingsCard } from '@/settings/components/SettingsCard';
import { SettingsSsoIdentitiesProvidersListCardWrapper } from '@/settings/security/components/sso/SettingsSsoIdentitiesProvidersListCardWrapper';
import { ssoIdentitiesProvidersState } from '@/settings/security/states/ssoIdentitiesProvidersState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useEffect } from 'react';
import { getSettingsPath } from 'twenty-shared/utils';
import { IconKey } from 'twenty-ui/icon';
import { GetSsoIdentityProvidersDocument } from '~/generated-metadata/graphql';

const StyledLinkContainer = styled.div`
  > a {
    text-decoration: none;
  }
`;

export const SettingsSsoIdentitiesProvidersListCard = () => {
  const { t } = useLingui();

  const [ssoIdentitiesProviders, setSsoIdentitiesProviders] = useAtomState(
    ssoIdentitiesProvidersState,
  );

  const {
    loading,
    data: ssoData,
    error: ssoError,
  } = useQuery(GetSsoIdentityProvidersDocument, {
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    if (ssoData) {
      setSsoIdentitiesProviders(ssoData?.getSSOIdentityProviders ?? []);
    }
  }, [ssoData, setSsoIdentitiesProviders]);

  return (
    <>
      <ToastOnQueryErrorEffect error={ssoError} />
      {loading || !ssoIdentitiesProviders.length ? (
        <StyledLinkContainer>
          <Link to={getSettingsPath(SettingsPath.NewSsoIdentityProvider)}>
            <SettingsCard
              title={t`Add SSO Identity Provider`}
              Icon={<IconKey />}
            />
          </Link>
        </StyledLinkContainer>
      ) : (
        <SettingsSsoIdentitiesProvidersListCardWrapper />
      )}
    </>
  );
};
