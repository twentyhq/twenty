import { styled } from '@linaria/atomic';

import { Tenant, TenantPlan, TenantStatus } from '../types/billing.types';

type TenantListProps = {
  tenants: Tenant[];
  onTenantClick?: (tenantId: string) => void;
};

const PLAN_COLORS: Record<TenantPlan, string> = {
  free: '#94a3b8',
  starter: '#3b82f6',
  professional: '#8b5cf6',
  enterprise: '#f59e0b',
};

const STATUS_COLORS: Record<TenantStatus, string> = {
  active: '#22c55e',
  trial: '#3b82f6',
  suspended: '#ef4444',
  churned: '#6b7280',
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
`;

const Th = styled.th`
  text-align: left;
  padding: 8px 12px;
  border-bottom: 1px solid #e5e7eb;
  font-weight: 600;
  color: #6b7280;
`;

const Td = styled.td`
  padding: 8px 12px;
  border-bottom: 1px solid #f3f4f6;
`;

const Row = styled.tr`
  cursor: pointer;
  &:hover {
    background: #f9fafb;
  }
`;

const Badge = styled.span<{ color: string }>`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  color: white;
  background: ${(props) => props.color};
`;

const MrrValue = styled.span`
  font-weight: 600;
  font-variant-numeric: tabular-nums;
`;

export const TenantList = ({ tenants, onTenantClick }: TenantListProps) => {
  const formatCurrency = (amount: number, currency: string) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(
      amount,
    );

  return (
    <Container>
      <Table>
        <thead>
          <tr>
            <Th>Tenant</Th>
            <Th>Plan</Th>
            <Th>Status</Th>
            <Th>MRR</Th>
            <Th>Users</Th>
          </tr>
        </thead>
        <tbody>
          {tenants.map((tenant) => (
            <Row
              key={tenant.id}
              onClick={() => onTenantClick?.(tenant.id)}
            >
              <Td>{tenant.name}</Td>
              <Td>
                <Badge color={PLAN_COLORS[tenant.plan]}>{tenant.plan}</Badge>
              </Td>
              <Td>
                <Badge color={STATUS_COLORS[tenant.status]}>
                  {tenant.status}
                </Badge>
              </Td>
              <Td>
                <MrrValue>
                  {formatCurrency(tenant.mrr, tenant.currency)}
                </MrrValue>
              </Td>
              <Td>
                {tenant.userCount}/{tenant.maxUsers}
              </Td>
            </Row>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};
