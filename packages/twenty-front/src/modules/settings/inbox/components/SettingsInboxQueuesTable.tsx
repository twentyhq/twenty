import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { type InboxQueueSettings } from '~/generated/graphql';

const INBOX_QUEUE_TABLE_GRID = '3fr 2fr 1fr';

const StyledRow = styled(TableRow)`
  &:hover {
    background: ${themeCssVariables.background.transparent.lighter};
  }
`;

const StyledName = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledAddress = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
`;

export const SettingsInboxQueuesTable = ({
  inboxQueues,
}: {
  inboxQueues: InboxQueueSettings[];
}) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  return (
    <Table>
      <TableRow gridTemplateColumns={INBOX_QUEUE_TABLE_GRID}>
        <TableHeader>{t`Name`}</TableHeader>
        <TableHeader>{t`Address`}</TableHeader>
        <TableHeader align="right">{t`Members`}</TableHeader>
      </TableRow>
      <TableBody>
        {inboxQueues.map((inboxQueue) => {
          const QueueIcon = getIcon(inboxQueue.icon);

          return (
            <StyledRow
              key={inboxQueue.id}
              gridTemplateColumns={INBOX_QUEUE_TABLE_GRID}
              to={getSettingsPath(SettingsPath.InboxQueueDetail, {
                queueId: inboxQueue.id,
              })}
            >
              <TableCell>
                <StyledName>
                  <QueueIcon size={16} />
                  {inboxQueue.name}
                </StyledName>
              </TableCell>
              <TableCell>
                <StyledAddress>/inbox/q/{inboxQueue.slug}</StyledAddress>
              </TableCell>
              <TableCell align="right">
                {inboxQueue.memberWorkspaceMemberIds.length}
              </TableCell>
            </StyledRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
