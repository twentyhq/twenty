import { Link, useNavigate } from 'react-router-dom';

import { SettingsPath } from 'twenty-shared/types';

import { SettingsCard } from '@/settings/components/SettingsCard';
import { SettingsListCard } from '@/settings/components/SettingsListCard';
import { SettingsSecurityApprovedAccessDomainRowDropdownMenu } from '@/settings/security/components/approvedAccessDomains/SettingsSecurityApprovedAccessDomainRowDropdownMenu';
import { SettingsSecurityApprovedAccessDomainValidationEffect } from '@/settings/security/components/approvedAccessDomains/SettingsSecurityApprovedAccessDomainValidationEffect';
import { approvedAccessDomainsState } from '@/settings/security/states/ApprovedAccessDomainsState';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { styled } from '@linaria/react';
import { useEffect } from 'react';
import { useLingui } from '@lingui/react/macro';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { getSettingsPath } from 'twenty-shared/utils';
import { IconAt, IconMailCog, Status } from 'twenty-ui/display';
import { useQuery } from '@apollo/client/react';
import { GetApprovedAccessDomainsDocument } from '~/generated-metadata/graphql';
import { dateLocaleState } from '~/localization/states/dateLocaleState';
import { beautifyPastDateRelativeToNow } from '~/utils/date-utils';

const StyledLinkContainer = styled.div`
  > a {
    text-decoration: none;
  }
`;

export const SettingsApprovedAccessDomainsListCard = () => {
  const { enqueueErrorSnackBar } = useSnackBar();
  const navigate = useNavigate();
  const { t } = useLingui();
  const { localeCatalog } = useAtomStateValue(dateLocaleState);

  const [approvedAccessDomains, setApprovedAccessDomains] = useAtomState(
    approvedAccessDomainsState,
  );

  const { loading, data: domainsData, error: domainsError } = useQuery(GetApprovedAccessDomainsDocument, {
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    if (domainsData) {
      setApprovedAccessDomains(domainsData?.getApprovedAccessDomains ?? []);
    }
  }, [domainsData, setApprovedAccessDomains]);

  useEffect(() => {
    if (domainsError) {
      enqueueErrorSnackBar({
        apolloError: CombinedGraphQLErrors.is(domainsError) ? domainsError : undefined,
      });
    }
  }, [domainsError, enqueueErrorSnackBar]);

  const getItemDescription = (createdAt: string) => {
    const beautifyPastDateRelative = beautifyPastDateRelativeToNow(
      createdAt,
      localeCatalog,
    );
    return t`Added ${beautifyPastDateRelative}`;
  };

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
        getItemDescription={({ createdAt }) => getItemDescription(createdAt)}
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
