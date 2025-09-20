import { SettingsEmailingDomainVerificationRecordsTableHeader } from '@/settings/emailing-domains/components/SettingsEmailingDomainVerificationRecordsTableHeader';
import { SettingsEmailingDomainVerificationRecordsTableRow } from '@/settings/emailing-domains/components/SettingsEmailingDomainVerificationRecordsTableRow';
import { Table } from '@/ui/layout/table/components/Table';
import styled from '@emotion/styled';
import { H2Title } from 'twenty-ui/display';
import { Card, Section } from 'twenty-ui/layout';
import { type VerificationRecord } from '~/generated-metadata/graphql';

const StyledTableContainer = styled(Card)`
  overflow: hidden;
`;

type SettingsEmailingDomainVerificationRecordsProps = {
  verificationRecords: VerificationRecord[];
  title: string;
  description?: string;
  isRequired?: boolean;
};

export const SettingsEmailingDomainVerificationRecords = ({
  verificationRecords,
  description,
  title,
}: SettingsEmailingDomainVerificationRecordsProps) => {
  if (!verificationRecords || verificationRecords.length === 0) {
    return null;
  }

  return (
    <Section>
      <H2Title title={title} description={description} />
      <StyledTableContainer rounded>
        <SettingsEmailingDomainVerificationRecordsTableHeader />
        <Table>
          {verificationRecords.map((record, index) => (
            <SettingsEmailingDomainVerificationRecordsTableRow
              key={`${record.type}-${record.name}-${index}`}
              verificationRecord={record}
            />
          ))}
        </Table>
      </StyledTableContainer>
    </Section>
  );
};
