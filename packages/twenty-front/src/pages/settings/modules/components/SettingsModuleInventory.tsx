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
`;

type Warehouse = {
  id: string;
  name: string;
  address: string;
  skuCount: number;
  isActive: boolean;
};

type LowStockAlert = {
  productName: string;
  sku: string;
  warehouse: string;
  available: number;
  reorderPoint: number;
  severity: 'critical' | 'warning' | 'info';
};

export const SettingsModuleInventory = () => {
  const { t } = useLingui();

  const [costingMethod, setCostingMethod] = useState('weighted_average');
  const [lowStockThreshold, setLowStockThreshold] = useState('10');
  const [autoReorder, setAutoReorder] = useState('true');

  const [warehouses] = useState<Warehouse[]>([
    { id: '1', name: 'Main Warehouse', address: 'Bogota, Colombia', skuCount: 542, isActive: true },
    { id: '2', name: 'Distribution Center', address: 'Medellin, Colombia', skuCount: 318, isActive: true },
    { id: '3', name: 'Returns Hub', address: 'Cali, Colombia', skuCount: 87, isActive: false },
  ]);

  const [alerts] = useState<LowStockAlert[]>([
    { productName: 'Widget Pro X', sku: 'WPX-001', warehouse: 'Main Warehouse', available: 3, reorderPoint: 25, severity: 'critical' },
    { productName: 'Connector Cable 2m', sku: 'CC2-100', warehouse: 'Distribution Center', available: 12, reorderPoint: 20, severity: 'warning' },
    { productName: 'Sensor Module v3', sku: 'SM3-050', warehouse: 'Main Warehouse', available: 18, reorderPoint: 20, severity: 'info' },
  ]);

  return (
    <SubMenuTopBarContainer
      title={t`Inventory Management`}
      links={[
        { children: t`Modules`, href: getSettingsPath(SettingsPath.EnterpriseModules) },
        { children: t`Inventory` },
      ]}
    >
      <StyledContainer>
        <StyledTitle>{t`Inventory Configuration`}</StyledTitle>

        <StyledSection>
          <StyledSectionTitle>{t`Warehouses`}</StyledSectionTitle>
          <StyledTable>
            <thead>
              <tr>
                <StyledTh>{t`Name`}</StyledTh>
                <StyledTh>{t`Address`}</StyledTh>
                <StyledTh>{t`SKUs`}</StyledTh>
                <StyledTh>{t`Status`}</StyledTh>
              </tr>
            </thead>
            <tbody>
              {warehouses.map((warehouse) => (
                <tr key={warehouse.id}>
                  <StyledTd>{warehouse.name}</StyledTd>
                  <StyledTd>{warehouse.address}</StyledTd>
                  <StyledTd>{warehouse.skuCount}</StyledTd>
                  <StyledTd>
                    {warehouse.isActive ? t`Active` : t`Inactive`}
                  </StyledTd>
                </tr>
              ))}
            </tbody>
          </StyledTable>
        </StyledSection>

        <StyledSection>
          <StyledSectionTitle>{t`Low Stock Alerts`}</StyledSectionTitle>
          {alerts.length === 0 ? (
            <p>{t`No low stock alerts at this time.`}</p>
          ) : (
            alerts.map((alert) => (
              <StyledAlertRow key={alert.sku} severity={alert.severity}>
                <div>
                  <strong>{alert.productName}</strong> ({alert.sku})
                  <br />
                  <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                    {alert.warehouse} - {t`Available`}: {alert.available} / {t`Reorder at`}: {alert.reorderPoint}
                  </span>
                </div>
                <StyledButton variant="secondary">
                  {t`Create PO`}
                </StyledButton>
              </StyledAlertRow>
            ))
          )}
        </StyledSection>

        <StyledSection>
          <StyledSectionTitle>{t`Costing & Reorder Settings`}</StyledSectionTitle>
          <StyledFormGroup>
            <StyledLabel>{t`Costing Method`}</StyledLabel>
            <StyledSelect
              value={costingMethod}
              onChange={(event) => setCostingMethod(event.target.value)}
            >
              <option value="fifo">{t`FIFO (First In, First Out)`}</option>
              <option value="lifo">{t`LIFO (Last In, First Out)`}</option>
              <option value="weighted_average">{t`Weighted Average`}</option>
            </StyledSelect>
          </StyledFormGroup>
          <StyledFormRow>
            <StyledFormGroup style={{ flex: 1 }}>
              <StyledLabel>{t`Default Low Stock Threshold`}</StyledLabel>
              <StyledInput
                type="number"
                value={lowStockThreshold}
                onChange={(event) => setLowStockThreshold(event.target.value)}
              />
            </StyledFormGroup>
            <StyledFormGroup style={{ flex: 1 }}>
              <StyledLabel>{t`Auto-Reorder`}</StyledLabel>
              <StyledSelect
                value={autoReorder}
                onChange={(event) => setAutoReorder(event.target.value)}
              >
                <option value="true">{t`Enabled`}</option>
                <option value="false">{t`Disabled`}</option>
              </StyledSelect>
            </StyledFormGroup>
          </StyledFormRow>
          <StyledButton>{t`Save Settings`}</StyledButton>
        </StyledSection>
      </StyledContainer>
    </SubMenuTopBarContainer>
  );
};
