import styled from '@emotion/styled';

import { SettingsDevelopersWebhookTableRow } from '@/settings/developers/components/SettingsDevelopersWebhookTableRow';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { useGetWebhooksQuery } from '~/generated-metadata/graphql';

const StyledTableBody = styled(TableBody)`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  max-height: 260px;
  overflow-y: auto;
`;

const StyledTableRow = styled(TableRow)`
  grid-template-columns: 444px 68px;
`;

export const SettingsWebhooksTable = () => {
  const { data: webhooksData } = useGetWebhooksQuery();

  const webhooks = webhooksData?.webhooks;

  return (
    <Table>
      <StyledTableRow>
        <TableHeader>URL</TableHeader>
        <TableHeader></TableHeader>
      </StyledTableRow>
      {!!webhooks?.length && (
        <StyledTableBody>
          {webhooks.map((webhookFieldItem) => (
            <SettingsDevelopersWebhookTableRow
              key={webhookFieldItem.id}
              webhook={webhookFieldItem}
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
