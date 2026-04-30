import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { useNavigate } from 'react-router-dom';
import { getSettingsPath } from 'twenty-shared/utils';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[6]};
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
`;

const StyledModuleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledModuleCard = styled.div<{ isActive: boolean }>`
  border: 1px solid ${themeCssVariables.color.border};
  border-radius: 8px;
  padding: ${themeCssVariables.spacing[4]};
  cursor: pointer;
  transition: all 0.2s;
  background: ${(props) => (props.isActive ? themeCssVariables.color.background : 'transparent')};
  opacity: ${(props) => (props.isActive ? 1 : 0.6)};

  &:hover {
    border-color: ${themeCssVariables.color.accent};
    opacity: 1;
  }
`;

const StyledModuleName = styled.div`
  font-weight: 600;
  font-size: 0.95rem;
  margin-bottom: ${themeCssVariables.spacing[1]};
`;

const StyledModuleDescription = styled.div`
  font-size: 0.8rem;
  color: ${themeCssVariables.color.font.secondary};
  margin-bottom: ${themeCssVariables.spacing[2]};
`;

const StyledBadge = styled.span<{ variant: string }>`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  background: ${(props) =>
    props.variant === 'active' ? '#10b981' :
    props.variant === 'pro' ? '#3b82f6' :
    props.variant === 'enterprise' ? '#8b5cf6' : '#6b7280'};
  color: white;
`;

const StyledCategory = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: ${themeCssVariables.color.font.secondary};
  margin-bottom: ${themeCssVariables.spacing[2]};
  margin-top: ${themeCssVariables.spacing[4]};
`;

type ModuleInfo = {
  code: string;
  name: string;
  description: string;
  category: string;
  plan: 'starter' | 'professional' | 'enterprise';
  isActive: boolean;
};

const ENTERPRISE_MODULES: ModuleInfo[] = [
  // Sales
  { code: 'gamification', name: 'Gamification', description: 'Leaderboards, badges and sales challenges', category: 'Sales', plan: 'professional', isActive: true },
  { code: 'prm', name: 'Partner Management', description: 'Partner lifecycle, deal registration, MDF', category: 'Sales', plan: 'enterprise', isActive: false },
  // Marketing
  { code: 'marketing', name: 'Marketing Campaigns', description: 'Campaigns, lead scoring, attribution', category: 'Marketing', plan: 'professional', isActive: true },
  { code: 'events', name: 'Events & Webinars', description: 'Event management, QR check-in, ROI', category: 'Marketing', plan: 'professional', isActive: false },
  // Service
  { code: 'support_ticket', name: 'Helpdesk & Support', description: 'Tickets, SLA, CSAT tracking', category: 'Service', plan: 'starter', isActive: true },
  { code: 'knowledge_base', name: 'Knowledge Base', description: 'Articles, search, suggestions', category: 'Service', plan: 'starter', isActive: true },
  { code: 'field_service', name: 'Field Service', description: 'Work orders, dispatch, technicians', category: 'Service', plan: 'enterprise', isActive: false },
  // Finance
  { code: 'accounts_receivable', name: 'Accounts Receivable', description: 'Invoicing, dunning, cash application', category: 'Finance', plan: 'professional', isActive: true },
  { code: 'accounting', name: 'Accounting Integration', description: 'ERP sync, tax rules, commissions', category: 'Finance', plan: 'professional', isActive: false },
  { code: 'fintech', name: 'FinTech Layer', description: 'Embedded payments, e-invoicing', category: 'Finance', plan: 'enterprise', isActive: false },
  // Operations
  { code: 'inventory', name: 'Inventory', description: 'Multi-warehouse stock management', category: 'Operations', plan: 'professional', isActive: true },
  { code: 'project', name: 'Project Management', description: 'Tasks, Gantt, time tracking, P&L', category: 'Operations', plan: 'professional', isActive: false },
  { code: 'procurement', name: 'Procurement', description: 'Purchase requests, RFQ, vendor scoring', category: 'Operations', plan: 'enterprise', isActive: false },
  { code: 'trade_import', name: 'Trade & Import', description: 'POs, shipments, customs, landed cost', category: 'Operations', plan: 'enterprise', isActive: false },
  { code: 'fleet', name: 'Fleet & Logistics', description: 'Vehicles, routes, delivery tracking', category: 'Operations', plan: 'enterprise', isActive: false },
  { code: 'it_assets', name: 'IT Asset Management', description: 'Assets, licenses, depreciation', category: 'Operations', plan: 'professional', isActive: false },
  // HR
  { code: 'hrm', name: 'HRM & Payroll', description: 'Employees, payroll, performance', category: 'HR', plan: 'enterprise', isActive: false },
  { code: 'lms', name: 'Learning Management', description: 'Courses, certifications, training ROI', category: 'HR', plan: 'professional', isActive: false },
  // Legal
  { code: 'clm', name: 'Contract Lifecycle', description: 'CLM, e-signatures, risk scoring', category: 'Legal', plan: 'professional', isActive: false },
  // Communications
  { code: 'asterisk', name: 'VoIP & Telephony', description: 'Click-to-call, IVR, auto-dialer', category: 'Communications', plan: 'professional', isActive: false },
  // Commerce
  { code: 'ecommerce', name: 'E-Commerce', description: 'Orders, carts, loyalty, CLV', category: 'Commerce', plan: 'enterprise', isActive: false },
];

export const SettingsEnterpriseModules = () => {
  const { t } = useLingui();
  const navigate = useNavigate();

  const categories = [...new Set(ENTERPRISE_MODULES.map((m) => m.category))];

  return (
    <SubMenuTopBarContainer
      title={t`Enterprise Modules`}
      links={[
        { children: t`Workspace`, href: getSettingsPath(SettingsPath.Workspace) },
        { children: t`Modules` },
      ]}
    >
      <StyledContainer>
        <StyledTitle>{t`Module Marketplace`}</StyledTitle>
        {categories.map((category) => (
          <div key={category}>
            <StyledCategory>{category}</StyledCategory>
            <StyledModuleGrid>
              {ENTERPRISE_MODULES.filter((m) => m.category === category).map((mod) => (
                <StyledModuleCard
                  key={mod.code}
                  isActive={mod.isActive}
                  onClick={() => navigate(getSettingsPath(SettingsPath.EnterpriseModuleDetail).replace(':moduleCode', mod.code))}
                >
                  <StyledModuleName>{mod.name}</StyledModuleName>
                  <StyledModuleDescription>{mod.description}</StyledModuleDescription>
                  <StyledBadge variant={mod.isActive ? 'active' : mod.plan}>
                    {mod.isActive ? t`Active` : mod.plan}
                  </StyledBadge>
                </StyledModuleCard>
              ))}
            </StyledModuleGrid>
          </div>
        ))}
      </StyledContainer>
    </SubMenuTopBarContainer>
  );
};
