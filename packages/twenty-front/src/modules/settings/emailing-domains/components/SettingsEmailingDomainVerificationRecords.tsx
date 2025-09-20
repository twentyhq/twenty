import { SettingsDnsRecordsTable } from '@/settings/components/SettingsDnsRecordsTable';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { type VerificationRecord } from '~/generated-metadata/graphql';

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

  const transformedRecords = verificationRecords.map((record) => ({
    type: record.type,
    key: record.name,
    value: record.value,
  }));

  return (
    <Section>
      <H2Title title={title} description={description} />
      <SettingsDnsRecordsTable records={transformedRecords} />
    </Section>
  );
};
