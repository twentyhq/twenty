import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';

import { SettingsOutboundMessageDomainVerificationRecords } from '@/settings/outbound-message-domains/components/SettingsOutboundMessageDomainVerificationRecords';
import { GET_ALL_OUTBOUND_MESSAGE_DOMAINS } from '@/settings/outbound-message-domains/graphql/queries/getOutboundMessageDomains';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useQuery } from '@apollo/client';
import { Trans, useLingui } from '@lingui/react/macro';
import { useParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { type GetOutboundMessageDomainsQuery } from '~/generated-metadata/graphql';

export const SettingsOutboundMessageDomainDetail = () => {
  const { t } = useLingui();
  const { domainId } = useParams<{ domainId: string }>();

  const { data, loading, error } = useQuery<GetOutboundMessageDomainsQuery>(
    GET_ALL_OUTBOUND_MESSAGE_DOMAINS,
    {
      skip: !domainId,
    },
  );

  const outboundMessageDomain = data?.getOutboundMessageDomains?.find(
    (domain) => domain.id === domainId,
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  if (isDefined(error) || !isDefined(outboundMessageDomain)) {
    return <Trans>Domain not found</Trans>;
  }

  return (
    <SubMenuTopBarContainer
      title={outboundMessageDomain.domain}
      links={[
        {
          children: <Trans>Workspace</Trans>,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        {
          children: <Trans>Domains</Trans>,
          href: getSettingsPath(SettingsPath.Domains),
        },
        {
          href: getSettingsPath(SettingsPath.NewOutboundMessageDomain),
          children: <Trans>Outbound Message Domains</Trans>,
        },
        { children: outboundMessageDomain.domain },
      ]}
    >
      <SettingsPageContainer>
        {outboundMessageDomain.verificationRecords &&
          outboundMessageDomain.verificationRecords.length > 0 && (
            <SettingsOutboundMessageDomainVerificationRecords
              title={t`DNS Records`}
              verificationRecords={outboundMessageDomain.verificationRecords}
              description={t`DNS records required for this domain to be verified and operational.`}
            />
          )}
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
