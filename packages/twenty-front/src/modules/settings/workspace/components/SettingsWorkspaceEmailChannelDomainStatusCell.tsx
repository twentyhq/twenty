import { useQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';

import { type MessageChannel } from '@/accounts/types/MessageChannel';
import { getEmailChannelDomain } from '@/settings/accounts/utils/getEmailChannelDomain';
import {
  EmailingDomainStatus,
  GetEmailingDomainsDocument,
  UnsubscribeHostnameStatus,
} from '~/generated-metadata/graphql';
import { getEmailingDomainStatusDisplay } from '@/settings/emailing-domains/utils/getEmailingDomainStatusDisplay';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Status } from 'twenty-ui/primitives/data-display';
import { Tooltip } from 'twenty-ui/primitives/surfaces';

type SettingsWorkspaceEmailChannelDomainStatusCellProps = {
  item: MessageChannel;
};

export const SettingsWorkspaceEmailChannelDomainStatusCell = ({
  item,
}: SettingsWorkspaceEmailChannelDomainStatusCellProps) => {
  const { t } = useLingui();
  const { data } = useQuery(GetEmailingDomainsDocument);
  const isMessageCampaignEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_MESSAGE_CAMPAIGN_ENABLED,
  );

  const channelDomain = getEmailChannelDomain(item.connectedAccount?.handle);
  const emailingDomain = data?.getEmailingDomains?.find(
    (domain) => domain.domain.toLowerCase() === channelDomain,
  );

  if (!isDefined(emailingDomain)) {
    return null;
  }

  const isUnsubscribeHostnamePending =
    isMessageCampaignEnabled &&
    emailingDomain.status === EmailingDomainStatus.VERIFIED &&
    emailingDomain.unsubscribeHostnameStatus !==
      UnsubscribeHostnameStatus.ACTIVE;

  if (isUnsubscribeHostnamePending) {
    return (
      <Tooltip
        content={t`Unsubscribe record not verified`}
        description={t`Emails can be sent. Add the unsubscribe record to send campaigns.`}
      >
        <Status color="orange">{t`1 of 2 done`}</Status>
      </Tooltip>
    );
  }

  const { label, color } = getEmailingDomainStatusDisplay(
    emailingDomain.status,
  );

  return <Status color={color}>{label}</Status>;
};
