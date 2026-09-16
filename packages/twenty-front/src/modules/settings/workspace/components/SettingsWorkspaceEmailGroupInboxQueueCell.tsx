import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';

import { type MessageChannel } from '@/accounts/types/MessageChannel';
import { useInboxQueueSettings } from '@/settings/inbox/hooks/useInboxQueueSettings';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledCell = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  justify-content: flex-end;
  min-width: 0;
`;

type SettingsWorkspaceEmailGroupInboxQueueCellProps = {
  item: MessageChannel;
};

export const SettingsWorkspaceEmailGroupInboxQueueCell = ({
  item,
}: SettingsWorkspaceEmailGroupInboxQueueCellProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const { inboxQueues } = useInboxQueueSettings();

  const inboxQueue = inboxQueues.find(
    (queue) => queue.id === item.defaultInboxQueueId,
  );

  if (!isDefined(inboxQueue)) {
    return <StyledCell>{t`Default routing`}</StyledCell>;
  }

  const QueueIcon = getIcon(inboxQueue.icon);

  return (
    <StyledCell>
      <QueueIcon size={16} />
      {inboxQueue.label}
    </StyledCell>
  );
};
