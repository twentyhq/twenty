import { styled } from '@linaria/react';

import { SettingsDevelopersWebhookTableRow } from '@/settings/developers/components/SettingsDevelopersWebhookTableRow';
import { WEBHOOK_TABLE_ROW_GRID_TEMPLATE_COLUMNS } from '@/settings/developers/constants/WebhookTableRowGridTemplateColumns';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { themeCssVariables } from 'twenty-ui/theme';
import { useQuery } from '@apollo/client/react';
import { GetWebhooksDocument } from '~/generated-metadata/graphql';

const StyledTableBodyContainer = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  max-height: 260px;
  overflow-y: auto;
`;

type SettingsWebhooksTableProps = {
  onWebhookClick: (webhookId: string) => void;
};

export const SettingsWebhooksTable = ({
  onWebhookClick,
}: SettingsWebhooksTableProps) => {
  const { data: webhooksData } = useQuery(GetWebhooksDocument);

  const webhooks = webhooksData?.webhooks;

  return (
    <Table>
      <TableRow gridTemplateColumns={WEBHOOK_TABLE_ROW_GRID_TEMPLATE_COLUMNS}>
        <TableHeader>URL</TableHeader>
        <TableHeader></TableHeader>
      </TableRow>
      {!!webhooks?.length && (
        <StyledTableBodyContainer>
          <TableBody>
            {webhooks.map((webhookFieldItem) => (
              <SettingsDevelopersWebhookTableRow
                key={webhookFieldItem.id}
                webhook={webhookFieldItem}
                onClick={() => onWebhookClick(webhookFieldItem.id)}
              />
            ))}
          </TableBody>
        </StyledTableBodyContainer>
      )}
    </Table>
  );
};
