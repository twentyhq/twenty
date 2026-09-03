import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useIcons } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { useInboxSettings } from '@/settings/inbox/hooks/useInboxSettings';
import { Select } from '@/ui/input/components/Select';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import {
  type InboxItemTypeSettings,
  type InboxQueueSettings,
} from '~/generated/graphql';

const INBOX_ROUTING_TABLE_GRID = '2fr 2fr';

const TRIAGE_OPTION_VALUE = 'triage';

const StyledName = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

// Where each kind of work goes when the thing that produced it named nobody.
// Anything that needs a condition belongs in a workflow instead, which is why
// this is a default per type rather than a rule builder.
export const SettingsInboxRoutingTable = ({
  inboxItemTypes,
  inboxQueues,
}: {
  inboxItemTypes: InboxItemTypeSettings[];
  inboxQueues: InboxQueueSettings[];
}) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const { setInboxItemTypeDefaultQueue } = useInboxSettings();

  const queueOptions = [
    { value: TRIAGE_OPTION_VALUE, label: t`Triage` },
    ...inboxQueues
      .filter((inboxQueue) => !inboxQueue.isDefault)
      .map((inboxQueue) => ({
        value: inboxQueue.id,
        label: inboxQueue.name,
      })),
  ];

  return (
    <Table>
      <TableRow gridTemplateColumns={INBOX_ROUTING_TABLE_GRID}>
        <TableHeader>{t`Kind of work`}</TableHeader>
        <TableHeader>{t`Goes to`}</TableHeader>
      </TableRow>
      <TableBody>
        {inboxItemTypes.map((inboxItemType) => {
          const TypeIcon = getIcon(inboxItemType.icon);

          return (
            <TableRow
              key={inboxItemType.id}
              gridTemplateColumns={INBOX_ROUTING_TABLE_GRID}
            >
              <TableCell>
                <StyledName>
                  <TypeIcon size={16} />
                  {inboxItemType.label}
                </StyledName>
              </TableCell>
              <TableCell>
                <Select
                  dropdownId={`inbox-routing-${inboxItemType.id}`}
                  value={inboxItemType.defaultQueueId ?? TRIAGE_OPTION_VALUE}
                  options={queueOptions}
                  onChange={(value) =>
                    void setInboxItemTypeDefaultQueue({
                      inboxItemTypeId: inboxItemType.id,
                      defaultQueueId:
                        value === TRIAGE_OPTION_VALUE ? null : value,
                    })
                  }
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
