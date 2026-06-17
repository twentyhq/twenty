import { useQuery } from '@apollo/client/react';

import { type MessageChannel } from '@/accounts/types/MessageChannel';
import { getEmailChannelDomain } from '@/settings/accounts/utils/getEmailChannelDomain';
import { GetEmailingDomainsDocument } from '~/generated-metadata/graphql';
import { getColorByEmailingDomainStatus } from '~/pages/settings/emailing-domains/utils/getEmailingDomainStatusColor';
import { getTextByEmailingDomainStatus } from '~/pages/settings/emailing-domains/utils/getEmailingDomainStatusText';
import { isDefined } from 'twenty-shared/utils';
import { Status } from 'twenty-ui/display';

type SettingsWorkspaceEmailChannelDomainStatusCellProps = {
  item: MessageChannel;
};

export const SettingsWorkspaceEmailChannelDomainStatusCell = ({
  item,
}: SettingsWorkspaceEmailChannelDomainStatusCellProps) => {
  const { data } = useQuery(GetEmailingDomainsDocument);

  const channelDomain = getEmailChannelDomain(item.connectedAccount?.handle);
  const emailingDomain = data?.getEmailingDomains?.find(
    (domain) => domain.domain.toLowerCase() === channelDomain,
  );

  if (!isDefined(emailingDomain)) {
    return null;
  }

  return (
    <Status
      color={getColorByEmailingDomainStatus(emailingDomain.status)}
      text={getTextByEmailingDomainStatus(emailingDomain.status)}
    />
  );
};
