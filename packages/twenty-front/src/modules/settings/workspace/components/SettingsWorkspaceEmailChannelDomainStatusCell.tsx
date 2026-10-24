import { useQuery } from '@apollo/client/react';

import { type MessageChannel } from '@/accounts/types/MessageChannel';
import { getEmailChannelDomain } from '@/settings/accounts/utils/getEmailChannelDomain';
import { GetEmailingDomainsDocument } from '~/generated-metadata/graphql';
import { getEmailingDomainSetupStatusDisplay } from '@/settings/emailing-domains/utils/getEmailingDomainSetupStatusDisplay';
import { isDefined } from 'twenty-shared/utils';
import { Status } from 'twenty-ui/primitives/data-display';
import { Tooltip } from 'twenty-ui/primitives/surfaces';

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

  const { label, color, tooltip } =
    getEmailingDomainSetupStatusDisplay(emailingDomain);

  if (!isDefined(tooltip)) {
    return <Status color={color}>{label}</Status>;
  }

  return (
    <Tooltip content={tooltip.content} description={tooltip.description}>
      <Status color={color}>{label}</Status>
    </Tooltip>
  );
};
