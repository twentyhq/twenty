import { Link, useNavigate } from 'react-router-dom';

import { SettingsPath } from '@/types/SettingsPath';

import { SettingsCard } from '@/settings/components/SettingsCard';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useRecoilState } from 'recoil';
import { IconAt, IconMailCog } from 'twenty-ui';
import { useGetAllWorkspaceTrustedDomainsQuery } from '~/generated/graphql';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';
import { SettingsListCard } from '@/settings/components/SettingsListCard';
import { workspaceTrustedDomainsState } from '@/settings/security/states/WorkspaceTrustedDomainsState';
import { SettingsSecurityTrustedDomainRowDropdownMenu } from '@/settings/security/components/workspaceTrustedDomains/SettingsSecurityTrustedDomainRowDropdownMenu';

const StyledLink = styled(Link)`
  text-decoration: none;
`;

export const SettingsTrustedDomainsListCard = () => {
  const { enqueueSnackBar } = useSnackBar();
  const navigate = useNavigate();

  const [workspaceTrustedDomains, setWorkspaceTrustedDomains] = useRecoilState(
    workspaceTrustedDomainsState,
  );

  const { t } = useLingui();

  const { loading } = useGetAllWorkspaceTrustedDomainsQuery({
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      setWorkspaceTrustedDomains(data?.getAllWorkspaceTrustedDomains ?? []);
    },
    onError: (error: Error) => {
      enqueueSnackBar(error.message, {
        variant: SnackBarVariant.Error,
      });
    },
  });

  return loading || !workspaceTrustedDomains.length ? (
    <StyledLink to={getSettingsPath(SettingsPath.NewTrustedDomain)}>
      <SettingsCard
        title={t`Add Trusted Email Domain`}
        Icon={<IconMailCog />}
      />
    </StyledLink>
  ) : (
    <SettingsListCard
      items={workspaceTrustedDomains}
      getItemLabel={(workspaceTrustedDomain) =>
        `${workspaceTrustedDomain.domain} - ${workspaceTrustedDomain.createdAt}`
      }
      RowIcon={IconAt}
      RowRightComponent={({ item: workspaceTrustedDomain }) => (
        <SettingsSecurityTrustedDomainRowDropdownMenu
          workspaceTrustedDomain={workspaceTrustedDomain}
        />
      )}
      hasFooter
      footerButtonLabel="Add Trusted Domain"
      onFooterButtonClick={() =>
        navigate(getSettingsPath(SettingsPath.NewTrustedDomain))
      }
    />
  );
};
