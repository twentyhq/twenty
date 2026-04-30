import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { SettingsPath } from 'twenty-shared/types';
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

const StyledSection = styled.div`
  border: 1px solid ${themeCssVariables.color.border};
  border-radius: 8px;
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledSectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 ${themeCssVariables.spacing[3]} 0;
`;

const StyledPlanCard = styled.div<{ isCurrent: boolean }>`
  border: 2px solid
    ${(props) =>
      props.isCurrent
        ? themeCssVariables.color.accent
        : themeCssVariables.color.border};
  border-radius: 8px;
  padding: ${themeCssVariables.spacing[4]};
  position: relative;
`;

const StyledPlanBadge = styled.span`
  position: absolute;
  top: -10px;
  right: 16px;
  padding: 2px 12px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 700;
  background: ${themeCssVariables.color.accent};
  color: white;
`;

const StyledPlanName = styled.div`
  font-size: 1.1rem;
  font-weight: 700;
`;

const StyledPlanPrice = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  margin: 8px 0;
`;

const StyledPlanFeature = styled.div`
  font-size: 0.8rem;
  color: ${themeCssVariables.color.font.secondary};
  padding: 2px 0;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
`;

const StyledTh = styled.th`
  text-align: left;
  padding: 8px 12px;
  border-bottom: 2px solid ${themeCssVariables.color.border};
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: ${themeCssVariables.color.font.secondary};
`;

const StyledTd = styled.td`
  padding: 8px 12px;
  border-bottom: 1px solid ${themeCssVariables.color.border};
`;

const StyledToggle = styled.button<{ isEnabled: boolean }>`
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  background: ${(props) => (props.isEnabled ? '#10b981' : '#6b7280')};
  color: white;
  transition: background 0.2s;

  &:hover {
    opacity: 0.85;
  }
`;

const StyledProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: ${themeCssVariables.color.border};
  border-radius: 4px;
  overflow: hidden;
`;

const StyledProgressFill = styled.div<{ percent: number; color?: string }>`
  height: 100%;
  width: ${(props) => props.percent}%;
  background: ${(props) =>
    props.color ??
    (props.percent > 90 ? '#ef4444' : props.percent > 70 ? '#f59e0b' : '#10b981')};
  border-radius: 4px;
  transition: width 0.3s;
`;

const StyledMeterRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: ${themeCssVariables.spacing[3]};
`;

const StyledMeterHeader = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
`;

const StyledMeterLabel = styled.span`
  font-weight: 600;
`;

const StyledMeterValue = styled.span`
  color: ${themeCssVariables.color.font.secondary};
`;

const StyledStatusBadge = styled.span<{ status: string }>`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  color: white;
  background: ${(props) =>
    props.status === 'paid'
      ? '#10b981'
      : props.status === 'pending'
        ? '#f59e0b'
        : '#ef4444'};
`;

type ModuleAddon = {
  code: string;
  name: string;
  price: string;
  isEnabled: boolean;
};

type UsageMeter = {
  label: string;
  used: number;
  limit: number;
  unit: string;
};

type Invoice = {
  id: string;
  date: string;
  amount: string;
  status: 'paid' | 'pending' | 'overdue';
};

export const SettingsModuleBilling = () => {
  const { t } = useLingui();

  const [addons, setAddons] = useState<ModuleAddon[]>([
    { code: 'voip', name: 'VoIP & Telephony', price: '$49/mo', isEnabled: false },
    { code: 'inventory', name: 'Inventory Management', price: '$29/mo', isEnabled: true },
    { code: 'helpdesk', name: 'Helpdesk & Support', price: '$19/mo', isEnabled: true },
    { code: 'project', name: 'Project Management', price: '$29/mo', isEnabled: false },
    { code: 'marketing', name: 'Marketing Campaigns', price: '$39/mo', isEnabled: true },
    { code: 'ecommerce', name: 'E-Commerce', price: '$59/mo', isEnabled: false },
    { code: 'hrm', name: 'HRM & Payroll', price: '$49/mo', isEnabled: false },
  ]);

  const [usageMeters] = useState<UsageMeter[]>([
    { label: 'Users', used: 24, limit: 50, unit: 'seats' },
    { label: 'Storage', used: 18, limit: 100, unit: 'GB' },
    { label: 'Call Minutes', used: 1240, limit: 5000, unit: 'min' },
    { label: 'API Calls', used: 45000, limit: 100000, unit: 'calls/mo' },
  ]);

  const [invoices] = useState<Invoice[]>([
    { id: 'INV-2026-004', date: '2026-04-01', amount: '$297.00', status: 'paid' },
    { id: 'INV-2026-003', date: '2026-03-01', amount: '$297.00', status: 'paid' },
    { id: 'INV-2026-002', date: '2026-02-01', amount: '$268.00', status: 'paid' },
    { id: 'INV-2026-001', date: '2026-01-01', amount: '$268.00', status: 'paid' },
  ]);

  const handleToggleAddon = (code: string) => {
    setAddons((prev) =>
      prev.map((addon) =>
        addon.code === code ? { ...addon, isEnabled: !addon.isEnabled } : addon,
      ),
    );
  };

  const activeAddonTotal = addons
    .filter((addon) => addon.isEnabled)
    .reduce((sum, addon) => {
      const price = parseInt(addon.price.replace(/[^0-9]/g, ''), 10);
      return sum + price;
    }, 0);

  return (
    <SubMenuTopBarContainer
      title={t`Billing & Subscription`}
      links={[
        { children: t`Modules`, href: getSettingsPath(SettingsPath.EnterpriseModules) },
        { children: t`Billing` },
      ]}
    >
      <StyledContainer>
        <StyledTitle>{t`Billing Dashboard`}</StyledTitle>

        <StyledPlanCard isCurrent={true}>
          <StyledPlanBadge>{t`Current Plan`}</StyledPlanBadge>
          <StyledPlanName>{t`Professional`}</StyledPlanName>
          <StyledPlanPrice>
            $199/mo <span style={{ fontSize: '0.8rem', fontWeight: 400 }}>+ ${activeAddonTotal}{t`/mo add-ons`}</span>
          </StyledPlanPrice>
          <StyledPlanFeature>{t`Up to 50 users`}</StyledPlanFeature>
          <StyledPlanFeature>{t`100 GB storage`}</StyledPlanFeature>
          <StyledPlanFeature>{t`Advanced analytics`}</StyledPlanFeature>
          <StyledPlanFeature>{t`Priority support`}</StyledPlanFeature>
          <StyledPlanFeature>{t`API access`}</StyledPlanFeature>
        </StyledPlanCard>

        <StyledSection>
          <StyledSectionTitle>{t`Module Add-ons`}</StyledSectionTitle>
          <StyledTable>
            <thead>
              <tr>
                <StyledTh>{t`Module`}</StyledTh>
                <StyledTh>{t`Price`}</StyledTh>
                <StyledTh>{t`Status`}</StyledTh>
              </tr>
            </thead>
            <tbody>
              {addons.map((addon) => (
                <tr key={addon.code}>
                  <StyledTd>{addon.name}</StyledTd>
                  <StyledTd>{addon.price}</StyledTd>
                  <StyledTd>
                    <StyledToggle
                      isEnabled={addon.isEnabled}
                      onClick={() => handleToggleAddon(addon.code)}
                    >
                      {addon.isEnabled ? t`Active` : t`Add`}
                    </StyledToggle>
                  </StyledTd>
                </tr>
              ))}
            </tbody>
          </StyledTable>
        </StyledSection>

        <StyledSection>
          <StyledSectionTitle>{t`Usage Meters`}</StyledSectionTitle>
          {usageMeters.map((meter) => {
            const percent = Math.round((meter.used / meter.limit) * 100);
            return (
              <StyledMeterRow key={meter.label}>
                <StyledMeterHeader>
                  <StyledMeterLabel>{meter.label}</StyledMeterLabel>
                  <StyledMeterValue>
                    {meter.used.toLocaleString()} / {meter.limit.toLocaleString()} {meter.unit} ({percent}%)
                  </StyledMeterValue>
                </StyledMeterHeader>
                <StyledProgressBar>
                  <StyledProgressFill percent={percent} />
                </StyledProgressBar>
              </StyledMeterRow>
            );
          })}
        </StyledSection>

        <StyledSection>
          <StyledSectionTitle>{t`Invoice History`}</StyledSectionTitle>
          <StyledTable>
            <thead>
              <tr>
                <StyledTh>{t`Invoice`}</StyledTh>
                <StyledTh>{t`Date`}</StyledTh>
                <StyledTh>{t`Amount`}</StyledTh>
                <StyledTh>{t`Status`}</StyledTh>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <StyledTd>{invoice.id}</StyledTd>
                  <StyledTd>{invoice.date}</StyledTd>
                  <StyledTd>{invoice.amount}</StyledTd>
                  <StyledTd>
                    <StyledStatusBadge status={invoice.status}>
                      {invoice.status}
                    </StyledStatusBadge>
                  </StyledTd>
                </tr>
              ))}
            </tbody>
          </StyledTable>
        </StyledSection>
      </StyledContainer>
    </SubMenuTopBarContainer>
  );
};
