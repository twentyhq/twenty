import { styled } from '@linaria/atomic';

import { TenantModule, ModuleStatus } from '../types/billing.types';

type ModuleActivationProps = {
  modules: TenantModule[];
  onToggle?: (moduleId: string, newStatus: ModuleStatus) => void;
};

const STATUS_COLORS: Record<ModuleStatus, string> = {
  active: '#22c55e',
  inactive: '#94a3b8',
  trial: '#3b82f6',
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ModuleCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
`;

const ModuleInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const ModuleName = styled.span`
  font-weight: 600;
  font-size: 14px;
`;

const ModuleMeta = styled.span`
  font-size: 12px;
  color: #6b7280;
`;

const ToggleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StatusDot = styled.span<{ color: string }>`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${(props) => props.color};
`;

const ToggleButton = styled.button<{ isActive: boolean }>`
  width: 40px;
  height: 22px;
  border-radius: 11px;
  border: none;
  cursor: pointer;
  position: relative;
  background: ${(props) => (props.isActive ? '#22c55e' : '#d1d5db')};
  transition: background 0.2s;

  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${(props) => (props.isActive ? '20px' : '2px')};
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: white;
    transition: left 0.2s;
  }
`;

const Price = styled.span`
  font-size: 12px;
  color: #6b7280;
  font-variant-numeric: tabular-nums;
`;

export const ModuleActivation = ({
  modules,
  onToggle,
}: ModuleActivationProps) => {
  const formatPrice = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);

  const handleToggle = (tenantModule: TenantModule) => {
    const newStatus: ModuleStatus =
      tenantModule.status === 'active' ? 'inactive' : 'active';
    onToggle?.(tenantModule.id, newStatus);
  };

  return (
    <Container>
      {modules.map((tenantModule) => (
        <ModuleCard key={tenantModule.id}>
          <ModuleInfo>
            <ModuleName>{tenantModule.moduleName}</ModuleName>
            <ModuleMeta>
              {tenantModule.status === 'trial' &&
                tenantModule.trialEndsAt !== null &&
                `Trial ends ${new Date(tenantModule.trialEndsAt).toLocaleDateString()}`}
              {tenantModule.status === 'active' &&
                tenantModule.activatedAt !== null &&
                `Active since ${new Date(tenantModule.activatedAt).toLocaleDateString()}`}
              {tenantModule.status === 'inactive' && 'Not activated'}
            </ModuleMeta>
          </ModuleInfo>
          <ToggleRow>
            <Price>{formatPrice(tenantModule.monthlyPrice)}/mo</Price>
            <StatusDot color={STATUS_COLORS[tenantModule.status]} />
            <ToggleButton
              isActive={tenantModule.status === 'active'}
              onClick={() => handleToggle(tenantModule)}
            />
          </ToggleRow>
        </ModuleCard>
      ))}
    </Container>
  );
};
