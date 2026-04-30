import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { DataLocationData } from '../types/residency.types';

const MOCK_DATA_LOCATIONS: DataLocationData[] = [
  { id: 'DL-1', dataType: 'Contacts', region: 'eu_west', recordCount: 245000, sizeGb: 12.4, lastSyncedAt: '2026-04-28T15:00:00Z' },
  { id: 'DL-2', dataType: 'Deals', region: 'eu_west', recordCount: 89000, sizeGb: 8.2, lastSyncedAt: '2026-04-28T15:00:00Z' },
  { id: 'DL-3', dataType: 'Activities', region: 'us_east', recordCount: 1200000, sizeGb: 45.6, lastSyncedAt: '2026-04-28T14:30:00Z' },
  { id: 'DL-4', dataType: 'Attachments', region: 'us_east', recordCount: 320000, sizeGb: 210.0, lastSyncedAt: '2026-04-28T12:00:00Z' },
  { id: 'DL-5', dataType: 'Analytics', region: 'latam', recordCount: 5000000, sizeGb: 95.3, lastSyncedAt: '2026-04-28T15:15:00Z' },
];

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

const StyledResponsiveHide = styled.td`
  padding: ${themeCssVariables.spacing[2]};
  font-size: ${themeCssVariables.font.size.md};
  color: ${themeCssVariables.font.color.primary};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    display: none;
  }
`;

const StyledResponsiveHideHeader = styled.th`
  text-align: left;
  padding: ${themeCssVariables.spacing[2]};
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.tertiary};
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    display: none;
  }
`;

export const DataMap = () => {
  useLingui();

  return (
    <StyledContainer>
      <StyledTitle>{t`Data Location Overview`}</StyledTitle>
      <StyledTable>
        <thead>
          <tr>
            <StyledTh>{t`Data Type`}</StyledTh>
            <StyledTh>{t`Region`}</StyledTh>
            <StyledTh>{t`Records`}</StyledTh>
            <StyledResponsiveHideHeader>{t`Size (GB)`}</StyledResponsiveHideHeader>
            <StyledResponsiveHideHeader>{t`Last Synced`}</StyledResponsiveHideHeader>
          </tr>
        </thead>
        <tbody>
          {MOCK_DATA_LOCATIONS.map((location) => (
            <tr key={location.id}>
              <StyledTd>{location.dataType}</StyledTd>
              <StyledTd>{location.region}</StyledTd>
              <StyledTd>{location.recordCount.toLocaleString()}</StyledTd>
              <StyledResponsiveHide>{location.sizeGb}</StyledResponsiveHide>
              <StyledResponsiveHide>{new Date(location.lastSyncedAt).toLocaleString()}</StyledResponsiveHide>
            </tr>
          ))}
        </tbody>
      </StyledTable>
    </StyledContainer>
  );
};
