import { useQuery } from '@apollo/client/react';

import { type MessageChannel } from '@/accounts/types/MessageChannel';
import { GetEmailingDomainsDocument } from '~/generated-metadata/graphql';
import { getEmailingDomainStatusDisplay } from '@/settings/emailing-domains/utils/getEmailingDomainStatusDisplay';
import { getEmailDomain, isDefined } from 'twenty-shared/utils';
import { Status } from 'twenty-ui/primitives/data-display';

type SettingsWorkspaceEmailChannelDomainStatusCellProps = {
  item: MessageChannel;
};

export const SettingsWorkspaceEmailChannelDomainStatusCell = ({
  item,
}: SettingsWorkspaceEmailChannelDomainStatusCellProps) => {
  const { data } = useQuery(GetEmailingDomainsDocument);

  const channelDomain = getEmailDomain(item.connectedAccount?.handle);
  const emailingDomain = data?.getEmailingDomains?.find(
    (domain) => domain.domain.toLowerCase() === channelDomain,
  );

  if (!isDefined(emailingDomain)) {
    return null;
  }

  const { label, color } = getEmailingDomainStatusDisplay(
    emailingDomain.status,
  );

  return <Status color={color}>{label}</Status>;
};
