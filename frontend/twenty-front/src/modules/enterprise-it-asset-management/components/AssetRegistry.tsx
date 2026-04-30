import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { AssetData, AssetStatus } from '../types/assets.types';

const MOCK_ASSETS: AssetData[] = [
  { id: 'A-1', name: 'MacBook Pro 16"', type: 'Laptop', serialNumber: 'SN-001234', assignee: 'Ana Torres', status: 'active', purchaseDate: '2025-06-15', warrantyExpiry: '2028-06-15', value: 3200 },
  { id: 'A-2', name: 'Dell Monitor U2723QE', type: 'Monitor', serialNumber: 'SN-005678', assignee: 'Luis Reyes', status: 'active', purchaseDate: '2025-08-01', warrantyExpiry: '2028-08-01', value: 620 },
  { id: 'A-3', name: 'Cisco Switch 48-port', type: 'Network', serialNumber: 'SN-009012', assignee: 'Infra Team', status: 'maintenance', purchaseDate: '2024-01-10', warrantyExpiry: '2027-01-10', value: 4800 },
  { id: 'A-4', name: 'HP LaserJet Pro', type: 'Printer', serialNumber: 'SN-003456', assignee: 'Office Floor 3', status: 'retired', purchaseDate: '2022-03-20', warrantyExpiry: '2025-03-20', value: 450 },
];

const STATUS_COLORS: Record<AssetStatus, string> = {
  active: themeCssVariables.color.green,
  maintenance: themeCssVariables.color.yellow,
  retired: themeCssVariables.color.gray50,
  disposed: themeCssVariables.color.red,
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[4]};
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledTitle = styled.h2`
  font-size: ${themeCssVariables.font.size.lg};
  color: ${themeCssVariables.font.color.primary};
  margin: 0;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const StyledTh = styled.th`
  text-align: left;
  padding: ${themeCssVariables.spacing[2]};
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.tertiary};
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
`;

const StyledTd = styled.td`
  padding: ${themeCssVariables.spacing[2]};
  font-size: ${themeCssVariables.font.size.md};
  color: ${themeCssVariables.font.color.primary};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
`;

const StyledBadge = styled.span<{ color: string }>`
  padding: 2px 8px;
  border-radius: 4px;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  background: ${({ color }) => color};
  color: ${themeCssVariables.font.color.inverted};
`;

export const AssetRegistry = () => {
  useLingui();

  return (
    <StyledContainer>
      <StyledTitle>{t`IT Asset Registry`}</StyledTitle>
      <StyledTable>
        <thead>
          <tr>
            <StyledTh>{t`ID`}</StyledTh>
            <StyledTh>{t`Name`}</StyledTh>
            <StyledTh>{t`Type`}</StyledTh>
            <StyledTh>{t`Assignee`}</StyledTh>
            <StyledTh>{t`Status`}</StyledTh>
          </tr>
        </thead>
        <tbody>
          {MOCK_ASSETS.map((asset) => (
            <tr key={asset.id}>
              <StyledTd>{asset.id}</StyledTd>
              <StyledTd>{asset.name}</StyledTd>
              <StyledTd>{asset.type}</StyledTd>
              <StyledTd>{asset.assignee}</StyledTd>
              <StyledTd>
                <StyledBadge color={STATUS_COLORS[asset.status]}>
                  {asset.status}
                </StyledBadge>
              </StyledTd>
            </tr>
          ))}
        </tbody>
      </StyledTable>
    </StyledContainer>
  );
};
