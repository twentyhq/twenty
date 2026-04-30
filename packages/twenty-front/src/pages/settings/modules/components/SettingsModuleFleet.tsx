import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

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

const StyledFormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  margin-bottom: ${themeCssVariables.spacing[3]};
`;

const StyledLabel = styled.label`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${themeCssVariables.color.font.secondary};
`;

const StyledInput = styled.input`
  padding: 8px 12px;
  border: 1px solid ${themeCssVariables.color.border};
  border-radius: 6px;
  font-size: 0.85rem;
  background: transparent;
  color: inherit;

  &:focus {
    outline: none;
    border-color: ${themeCssVariables.color.accent};
  }
`;

const StyledSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid ${themeCssVariables.color.border};
  border-radius: 6px;
  font-size: 0.85rem;
  background: transparent;
  color: inherit;
`;

const StyledButton = styled.button<{ variant?: string }>`
  padding: 8px 20px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  background: ${(props) =>
    props.variant === 'danger'
      ? '#ef4444'
      : props.variant === 'secondary'
        ? themeCssVariables.color.border
        : '#3b82f6'};
  color: white;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.85;
  }
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    display: block;
    overflow-x: auto;
  }
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

const StyledStatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${themeCssVariables.spacing[3]};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const StyledStatCard = styled.div`
  background: ${themeCssVariables.color.background};
  border: 1px solid ${themeCssVariables.color.border};
  border-radius: 6px;
  padding: ${themeCssVariables.spacing[3]};
  text-align: center;
`;

const StyledStatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
`;

const StyledStatLabel = styled.div`
  font-size: 0.75rem;
  color: ${themeCssVariables.color.font.secondary};
  margin-top: 4px;
`;

const StyledAlertRow = styled.div<{ severity: string }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-radius: 6px;
  margin-bottom: 8px;
  background: ${(props) =>
    props.severity === 'critical'
      ? 'rgba(239, 68, 68, 0.1)'
      : props.severity === 'warning'
        ? 'rgba(245, 158, 11, 0.1)'
        : 'rgba(59, 130, 246, 0.1)'};
  border-left: 3px solid
    ${(props) =>
      props.severity === 'critical'
        ? '#ef4444'
        : props.severity === 'warning'
          ? '#f59e0b'
          : '#3b82f6'};
`;

const StyledFormRow = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  align-items: flex-end;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const StyledStatusDot = styled.span<{ status: string }>`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
  background: ${(props) =>
    props.status === 'connected'
      ? '#10b981'
      : props.status === 'error'
        ? '#ef4444'
        : '#f59e0b'};
`;

type Driver = {
  name: string;
  vehiclePlate: string;
  trips: number;
  rating: number;
  status: string;
};

type FuelAlert = {
  vehicle: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
};

type MaintenanceEntry = {
  vehicle: string;
  service: string;
  dueDate: string;
  status: string;
};

export const SettingsModuleFleet = () => {
  const { t } = useLingui();

  const [routeOptimization, setRouteOptimization] = useState('balanced');

  const [drivers] = useState<Driver[]>([
    { name: 'Carlos Mendez', vehiclePlate: 'ABC-123', trips: 245, rating: 4.8, status: 'active' },
    { name: 'Maria Lopez', vehiclePlate: 'DEF-456', trips: 198, rating: 4.6, status: 'active' },
    { name: 'Juan Torres', vehiclePlate: 'GHI-789', trips: 312, rating: 4.9, status: 'on_route' },
  ]);

  const [fuelAlerts] = useState<FuelAlert[]>([
    { vehicle: 'ABC-123', description: 'Fuel consumption 35% above average on last trip', severity: 'critical' },
    { vehicle: 'JKL-012', description: 'Unusual refueling location detected', severity: 'warning' },
    { vehicle: 'GHI-789', description: 'Low fuel level - 12% remaining', severity: 'info' },
  ]);

  const [maintenance] = useState<MaintenanceEntry[]>([
    { vehicle: 'ABC-123', service: 'Oil Change', dueDate: '2026-05-05', status: 'Upcoming' },
    { vehicle: 'DEF-456', service: 'Tire Rotation', dueDate: '2026-05-12', status: 'Scheduled' },
    { vehicle: 'GHI-789', service: 'Brake Inspection', dueDate: '2026-04-30', status: 'Overdue' },
  ]);

  return (
    <SubMenuTopBarContainer
      title={t`Fleet & Logistics`}
      links={[
        { children: t`Modules`, href: getSettingsPath(SettingsPath.EnterpriseModules) },
        { children: t`Fleet & Logistics` },
      ]}
    >
      <StyledContainer>
        <StyledTitle>{t`Fleet & Logistics Configuration`}</StyledTitle>

        <StyledSection>
          <StyledSectionTitle>{t`Vehicle Overview`}</StyledSectionTitle>
          <StyledStatGrid>
            <StyledStatCard>
              <StyledStatValue>24</StyledStatValue>
              <StyledStatLabel>{t`Total vehicles`}</StyledStatLabel>
            </StyledStatCard>
            <StyledStatCard>
              <StyledStatValue>18</StyledStatValue>
              <StyledStatLabel>{t`Active`}</StyledStatLabel>
            </StyledStatCard>
            <StyledStatCard>
              <StyledStatValue>4</StyledStatValue>
              <StyledStatLabel>{t`In maintenance`}</StyledStatLabel>
            </StyledStatCard>
            <StyledStatCard>
              <StyledStatValue>2</StyledStatValue>
              <StyledStatLabel>{t`Inactive`}</StyledStatLabel>
            </StyledStatCard>
          </StyledStatGrid>
        </StyledSection>

        <StyledSection>
          <StyledSectionTitle>{t`Driver Performance`}</StyledSectionTitle>
          <StyledTable>
            <thead>
              <tr>
                <StyledTh>{t`Driver`}</StyledTh>
                <StyledTh>{t`Vehicle`}</StyledTh>
                <StyledTh>{t`Trips`}</StyledTh>
                <StyledTh>{t`Rating`}</StyledTh>
                <StyledTh>{t`Status`}</StyledTh>
              </tr>
            </thead>
            <tbody>
              {drivers.map((driver) => (
                <tr key={driver.name}>
                  <StyledTd>{driver.name}</StyledTd>
                  <StyledTd>{driver.vehiclePlate}</StyledTd>
                  <StyledTd>{driver.trips}</StyledTd>
                  <StyledTd>{driver.rating}/5.0</StyledTd>
                  <StyledTd>
                    <StyledStatusDot
                      status={driver.status === 'active' ? 'connected' : 'pending'}
                    />
                    {driver.status === 'active' ? t`Active` : t`On Route`}
                  </StyledTd>
                </tr>
              ))}
            </tbody>
          </StyledTable>
        </StyledSection>

        <StyledSection>
          <StyledSectionTitle>{t`Fuel Anomaly Alerts`}</StyledSectionTitle>
          {fuelAlerts.map((alert, index) => (
            <StyledAlertRow key={index} severity={alert.severity}>
              <div>
                <strong>{alert.vehicle}</strong>
                <br />
                <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                  {alert.description}
                </span>
              </div>
              <StyledButton variant="secondary">{t`Review`}</StyledButton>
            </StyledAlertRow>
          ))}
        </StyledSection>

        <StyledSection>
          <StyledSectionTitle>{t`Maintenance Schedule`}</StyledSectionTitle>
          <StyledTable>
            <thead>
              <tr>
                <StyledTh>{t`Vehicle`}</StyledTh>
                <StyledTh>{t`Service`}</StyledTh>
                <StyledTh>{t`Due Date`}</StyledTh>
                <StyledTh>{t`Status`}</StyledTh>
              </tr>
            </thead>
            <tbody>
              {maintenance.map((entry, index) => (
                <tr key={index}>
                  <StyledTd>{entry.vehicle}</StyledTd>
                  <StyledTd>{entry.service}</StyledTd>
                  <StyledTd>{entry.dueDate}</StyledTd>
                  <StyledTd>{entry.status}</StyledTd>
                </tr>
              ))}
            </tbody>
          </StyledTable>
        </StyledSection>

        <StyledSection>
          <StyledSectionTitle>{t`Route Optimization`}</StyledSectionTitle>
          <StyledFormGroup>
            <StyledLabel>{t`Optimization Strategy`}</StyledLabel>
            <StyledSelect
              value={routeOptimization}
              onChange={(event) => setRouteOptimization(event.target.value)}
            >
              <option value="fastest">{t`Fastest Route`}</option>
              <option value="shortest">{t`Shortest Distance`}</option>
              <option value="balanced">{t`Balanced (Time + Fuel)`}</option>
              <option value="eco">{t`Eco-Friendly`}</option>
            </StyledSelect>
          </StyledFormGroup>
          <StyledButton>{t`Save Settings`}</StyledButton>
        </StyledSection>
      </StyledContainer>
    </SubMenuTopBarContainer>
  );
};
