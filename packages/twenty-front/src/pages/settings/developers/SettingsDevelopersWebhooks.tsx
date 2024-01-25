import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SettingsDevelopersWebhookTableRow } from '@/settings/developers/components/SettingsDevelopersWebhookTableRow';
import { WebhookFieldItem } from '@/settings/developers/types/WebhookFieldItem';
import { IconPlus } from '@/ui/display/icon';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { Button } from '@/ui/input/button/components/Button';
import { Section } from '@/ui/layout/section/components/Section';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';

const StyledDiv = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: ${({ theme }) => theme.spacing(2)};
`;

const StyledTableRow = styled(TableRow)`
  grid-template-columns: 444px 68px;
`;

const StyledTableBody = styled(TableBody)`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
`;

export const SettingsDevelopersWebhooks = () => {
  const navigate = useNavigate();

  const { records: webhooks } = useFindManyRecords({
    objectNameSingular: CoreObjectNameSingular.Webhook,
    orderBy: {},
  });

  return (
    <Section>
      <H2Title
        title="Webhooks"
        description="Establish Webhook endpoints for notifications on asynchronous events."
      />
      <Table>
        <StyledTableRow>
          <TableHeader>Url</TableHeader>
          <TableHeader></TableHeader>
        </StyledTableRow>
        {!!webhooks.length && (
          <StyledTableBody>
            {webhooks.map((fieldItem) => (
              <SettingsDevelopersWebhookTableRow
                key={fieldItem.id}
                fieldItem={fieldItem as WebhookFieldItem}
                onClick={() => {
                  navigate(`/settings/developers/webhooks/${fieldItem.id}`);
                }}
              />
            ))}
          </StyledTableBody>
        )}
      </Table>
      <StyledDiv>
        <Button
          Icon={IconPlus}
          title="Create Webhook"
          size="small"
          variant="secondary"
          soon={true}
          onClick={() => {
            navigate('/settings/developers/webhooks/new');
          }}
        />
      </StyledDiv>
    </Section>
  );
};
