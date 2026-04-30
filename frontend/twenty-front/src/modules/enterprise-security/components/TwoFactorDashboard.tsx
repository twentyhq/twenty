import { styled } from '@linaria/atomic';

import { TwoFactorStats, TwoFactorUser } from '../types/security.types';

type TwoFactorDashboardProps = {
  stats: TwoFactorStats;
  users: TwoFactorUser[];
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const StatsRow = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
`;

const StatCard = styled.div`
  flex: 1;
  min-width: 140px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: #111827;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ width: number }>`
  height: 100%;
  width: ${(props) => props.width}%;
  background: ${(props) => (props.width >= 80 ? '#22c55e' : props.width >= 50 ? '#f59e0b' : '#ef4444')};
  border-radius: 4px;
  transition: width 0.3s ease;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
`;

const Th = styled.th`
  text-align: left;
  padding: 8px 12px;
  border-bottom: 2px solid #e5e7eb;
  font-weight: 600;
`;

const Td = styled.td`
  padding: 8px 12px;
  border-bottom: 1px solid #f3f4f6;
`;

const EnabledBadge = styled.span<{ enabled: boolean }>`
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  color: white;
  background: ${(props) => (props.enabled ? '#22c55e' : '#9ca3af')};
`;

export const TwoFactorDashboard = ({
  stats,
  users,
}: TwoFactorDashboardProps) => {
  return (
    <Container>
      <StatsRow>
        <StatCard>
          <StatValue>{stats.totalUsers}</StatValue>
          <StatLabel>Total Users</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.enabledCount}</StatValue>
          <StatLabel>2FA Enabled</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.pendingCount}</StatValue>
          <StatLabel>Pending</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.adoptionPercentage}%</StatValue>
          <StatLabel>Adoption</StatLabel>
        </StatCard>
      </StatsRow>
      <ProgressBar>
        <ProgressFill width={stats.adoptionPercentage} />
      </ProgressBar>
      <Table>
        <thead>
          <tr>
            <Th>Name</Th>
            <Th>Email</Th>
            <Th>2FA Status</Th>
            <Th>Enrolled</Th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <Td>{user.name}</Td>
              <Td>{user.email}</Td>
              <Td>
                <EnabledBadge enabled={user.twoFactorEnabled}>
                  {user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </EnabledBadge>
              </Td>
              <Td>
                {user.enrolledAt !== null
                  ? new Date(user.enrolledAt).toLocaleDateString()
                  : '-'}
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};
