import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';

import { SettingsEmailingDomainVerificationRecords } from '@/settings/emailing-domains/components/SettingsEmailingDomainVerificationRecords';
import { GET_ALL_EMAILING_DOMAINS } from '@/settings/emailing-domains/graphql/queries/getAllEmailingDomains';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useQuery } from '@apollo/client';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { useParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { type GetEmailingDomainsQuery } from '~/generated-metadata/graphql';

export const SettingsEmailingDomainDetail = () => {
  const { domainId } = useParams<{ domainId: string }>();

  const { data, loading, error } = useQuery<GetEmailingDomainsQuery>(
    GET_ALL_EMAILING_DOMAINS,
    {
      skip: !domainId,
    },
  );

  const emailingDomain = data?.getEmailingDomains?.find(
    (domain) => domain.id === domainId,
  );

  if (loading) {
    return <div>{t`Loading...`}</div>;
  }

  if (isDefined(error) || !isDefined(emailingDomain)) {
    return <Trans>Domain not found</Trans>;
  }

  return (
    <SubMenuTopBarContainer
      title={emailingDomain.domain}
      links={[
        {
          children: <Trans>Workspace</Trans>,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        {
          children: <Trans>Emailing Domains</Trans>,
          href: getSettingsPath(SettingsPath.Domains),
        },
        { children: emailingDomain.domain },
      ]}
    >
      <SettingsPageContainer>
        {emailingDomain.verificationRecords &&
          emailingDomain.verificationRecords.length > 0 && (
            <SettingsEmailingDomainVerificationRecords
              domain={emailingDomain}
            />
          )}
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
