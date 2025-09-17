import { SettingsOutboundMessageDomainVerificationRecordsTableHeader } from '@/settings/outbound-message-domains/components/SettingsOutboundMessageDomainVerificationRecordsTableHeader';
import { SettingsOutboundMessageDomainVerificationRecordsTableRow } from '@/settings/outbound-message-domains/components/SettingsOutboundMessageDomainVerificationRecordsTableRow';
import { Table } from '@/ui/layout/table/components/Table';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { H2Title } from 'twenty-ui/display';
import { Card, Section } from 'twenty-ui/layout';
import { type VerificationRecord } from '~/generated-metadata/graphql';

const StyledTableContainer = styled(Card)`
  overflow: hidden;
`;

type SettingsOutboundMessageDomainVerificationRecordsProps = {
  verificationRecords: VerificationRecord[];
  title: string;
  description?: string;
  isRequired?: boolean;
};

export const SettingsOutboundMessageDomainVerificationRecords = ({
  verificationRecords,
  description,
}: SettingsOutboundMessageDomainVerificationRecordsProps) => {
  const { t } = useLingui();

  if (!verificationRecords || verificationRecords.length === 0) {
    return null;
  }

  return (
    <Section>
      <H2Title title={title} description={description} />
      <StyledTableContainer rounded>
        <SettingsOutboundMessageDomainVerificationRecordsTableHeader />
        <Table>
          {verificationRecords.map((record, index) => (
            <SettingsOutboundMessageDomainVerificationRecordsTableRow
              key={`${record.type}-${record.name}-${index}`}
              verificationRecord={record}
            />
          ))}
        </Table>
      </StyledTableContainer>
    </Section>
  );
};
