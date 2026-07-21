import { Link, useNavigate } from 'react-router-dom';

import { SettingsPath } from 'twenty-shared/types';

import { SettingsCard } from '@/settings/components/SettingsCard';
import { SettingsListCard } from '@/settings/components/SettingsListCard';
import { useGetAddedRelativeDateDescription } from '@/settings/hooks/useGetAddedRelativeDateDescription';
import { SettingsSecurityApprovedAccessDomainRowDropdownMenu } from '@/settings/security/components/approvedAccessDomains/SettingsSecurityApprovedAccessDomainRowDropdownMenu';
import { SettingsSecurityApprovedAccessDomainValidationEffect } from '@/settings/security/components/approvedAccessDomains/SettingsSecurityApprovedAccessDomainValidationEffect';
import { approvedAccessDomainsState } from '@/settings/security/states/ApprovedAccessDomainsState';
import { useSnackBarOnQueryError } from '@/apollo/hooks/useSnackBarOnQueryError';
import { styled } from '@linaria/react';
import { useEffect } from 'react';
import { useLingui } from '@lingui/react/macro';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { getSettingsPath } from 'twenty-shared/utils';
import { Status } from 'twenty-ui/data-display';
import { IconAt, IconMailCog } from 'twenty-ui/icon';
import { useQuery } from '@apollo/client/react';
import { GetApprovedAccessDomainsDocument } from '~/generated-metadata/graphql';

const StyledLinkContainer = styled.div`
  > a {
    text-decoration: none;
  }
`;

export const SettingsApprovedAccessDomainsListCard = () => {
  const navigate = useNavigate();
  const { t } = useLingui();
  const { getAddedRelativeDateDescription } =
    useGetAddedRelativeDateDescription();

  const [approvedAccessDomains, setApprovedAccessDomains] = useAtomState(
    approvedAccessDomainsState,
  );

  const {
    loading,
    data: domainsData,
    error: domainsError,
  } = useQuery(GetApprovedAccessDomainsDocument, {
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    if (domainsData) {
      setApprovedAccessDomains(domainsData?.getApprovedAccessDomains ?? []);
    }
  }, [domainsData, setApprovedAccessDomains]);

  useSnackBarOnQueryError(domainsError);

  return loading || !approvedAccessDomains.length ? (
    <StyledLinkContainer>
      <Link to={getSettingsPath(SettingsPath.NewApprovedAccessDomain)}>
        <SettingsCard
          title={t`Add Approved Access Domain`}
          Icon={<IconMailCog />}
        />
      </Link>
    </StyledLinkContainer>
  ) : (
    <>
      <SettingsSecurityApprovedAccessDomainValidationEffect />
      <SettingsListCard
        items={approvedAccessDomains}
        getItemLabel={({ domain }) => domain}
        getItemDescription={({ createdAt }) =>
          getAddedRelativeDateDescription(createdAt)
        }
        RowIcon={IconAt}
        RowRightComponent={({ item: approvedAccessDomain }) => (
          <>
            {!approvedAccessDomain.isValidated && (
              <Status color="orange" text={t`Pending`} />
            )}
            <SettingsSecurityApprovedAccessDomainRowDropdownMenu
              approvedAccessDomain={approvedAccessDomain}
            />
          </>
        )}
        hasFooter
        footerButtonLabel={t`Add Approved Access Domain`}
        onFooterButtonClick={() =>
          navigate(getSettingsPath(SettingsPath.NewApprovedAccessDomain))
        }
      />
    </>
  );
};
