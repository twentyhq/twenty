import { SettingsAdminTableCard } from '@/settings/admin-panel/components/SettingsAdminTableCard';
import styled from '@emotion/styled';
import { H2Title, Section } from 'twenty-ui';

const StyledSettingsAdminTableCard = styled(SettingsAdminTableCard)`
  padding-left: ${({ theme }) => theme.spacing(2)};
  padding-right: ${({ theme }) => theme.spacing(2)};
`;

export const SettingsAdminHealthAccountSyncCountersTable = ({
  details,
  title,
  description,
}: {
  details: Record<string, any> | null;
  title: string;
  description: string;
}) => {
  if (!details) {
    return null;
  }

  const items = [
    {
      label: 'Not Synced',
      value: details.counters.NOT_SYNCED,
    },
    {
      label: 'Active Sync',
      value: details.counters.ACTIVE,
    },
    {
      label: 'Total Jobs',
      value: details.totalJobs,
    },
    {
      label: 'Failed Jobs',
      value: details.failedJobs,
    },
    {
      label: 'Failure Rate',
      value: `${details.failureRate}%`,
    },
  ];

  return (
    <Section>
      <H2Title title={title} description={description} />
      <StyledSettingsAdminTableCard
        items={items}
        rounded
        gridAutoColumns="1fr 1fr"
        labelAlign="left"
        valueAlign="right"
      />
    </Section>
  );
};
