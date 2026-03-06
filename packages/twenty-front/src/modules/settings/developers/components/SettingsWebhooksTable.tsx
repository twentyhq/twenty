import { styled } from '@linaria/react';

import { SettingsDevelopersWebhookTableRow } from '@/settings/developers/components/SettingsDevelopersWebhookTableRow';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useGetWebhooksQuery } from '~/generated-metadata/graphql';

const StyledTableBodyContainer = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  max-height: 260px;
  overflow-y: auto;
`;

export const SettingsWebhooksTable = () => {
  const { data: webhooksData } = useGetWebhooksQuery();

  const webhooks = webhooksData?.webhooks;

  return (
    <Table>
      <TableRow gridTemplateColumns="444px 68px">
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
                to={getSettingsPath(SettingsPath.WebhookDetail, {
                  webhookId: webhookFieldItem.id,
                })}
              />
            ))}
          </TableBody>
        </StyledTableBodyContainer>
      )}
    </Table>
  );
};
