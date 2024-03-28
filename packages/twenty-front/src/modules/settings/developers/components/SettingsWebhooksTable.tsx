import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { Table, TableBody, TableHeader, TableRow } from 'twenty-ui';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SettingsDevelopersWebhookTableRow } from '@/settings/developers/components/SettingsDevelopersWebhookTableRow';
import { WebhookFieldItem } from '@/settings/developers/types/webhook/WebhookFieldItem';

const StyledTableBody = styled(TableBody)`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
`;

const StyledTableRow = styled(TableRow)`
  grid-template-columns: 444px 68px;
`;

export const SettingsWebhooksTable = () => {
  const navigate = useNavigate();

  const { records: webhooks } = useFindManyRecords<WebhookFieldItem>({
    objectNameSingular: CoreObjectNameSingular.Webhook,
  });

  return (
    <Table>
      <StyledTableRow>
        <TableHeader>Url</TableHeader>
        <TableHeader></TableHeader>
      </StyledTableRow>
      {!!webhooks.length && (
        <StyledTableBody>
          {webhooks.map((webhookFieldItem) => (
            <SettingsDevelopersWebhookTableRow
              key={webhookFieldItem.id}
              fieldItem={webhookFieldItem}
              onClick={() => {
                navigate(
                  `/settings/developers/webhooks/${webhookFieldItem.id}`,
                );
              }}
            />
          ))}
        </StyledTableBody>
      )}
    </Table>
  );
};
