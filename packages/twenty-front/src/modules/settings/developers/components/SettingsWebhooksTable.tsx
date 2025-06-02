import styled from '@emotion/styled';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SettingsDevelopersWebhookTableRow } from '@/settings/developers/components/SettingsDevelopersWebhookTableRow';
import { Webhook } from '@/settings/developers/types/webhook/Webhook';
import { SettingsPath } from '@/types/SettingsPath';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const StyledTableBody = styled(TableBody)`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  max-height: 260px;
  overflow-y: auto;
`;

const StyledTableRow = styled(TableRow)`
  grid-template-columns: 444px 68px;
`;

export const SettingsWebhooksTable = () => {
  const { records: webhooks } = useFindManyRecords<Webhook>({
    objectNameSingular: CoreObjectNameSingular.Webhook,
  });

  return (
    <Table>
      <StyledTableRow>
        <TableHeader>URL</TableHeader>
        <TableHeader></TableHeader>
      </StyledTableRow>
      {!!webhooks.length && (
        <StyledTableBody>
          {webhooks.map((webhookFieldItem) => (
            <SettingsDevelopersWebhookTableRow
              key={webhookFieldItem.id}
              fieldItem={webhookFieldItem}
              to={getSettingsPath(SettingsPath.WebhookDetail, {
                webhookId: webhookFieldItem.id,
              })}
            />
          ))}
        </StyledTableBody>
      )}
    </Table>
  );
};
