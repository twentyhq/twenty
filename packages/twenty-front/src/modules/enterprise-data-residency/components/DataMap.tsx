import { useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';
import { DataLocationData } from '../types/residency.types';
import { GET_DATA_RESIDENCY_ANALYTICS } from '../hooks/useDataResidency';

const StyledContainer = styled.div` display: flex; flex-direction: column; padding: ${themeCssVariables.spacing[4]}; gap: ${themeCssVariables.spacing[2]}; `;
const StyledTitle = styled.h2` font-size: ${themeCssVariables.font.size.lg}; color: ${themeCssVariables.font.color.primary}; margin: 0; `;
const StyledTable = styled.table` width: 100%; border-collapse: collapse; `;
const StyledTh = styled.th` text-align: left; padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.sm}; color: ${themeCssVariables.font.color.tertiary}; border-bottom: 1px solid ${themeCssVariables.border.color.medium}; `;
const StyledTd = styled.td` padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.md}; color: ${themeCssVariables.font.color.primary}; border-bottom: 1px solid ${themeCssVariables.border.color.light}; `;
const StyledRH = styled.td` padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.md}; color: ${themeCssVariables.font.color.primary}; border-bottom: 1px solid ${themeCssVariables.border.color.light}; @media (max-width: ${MOBILE_VIEWPORT}px) { display: none; } `;
const StyledRHH = styled.th` text-align: left; padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.sm}; color: ${themeCssVariables.font.color.tertiary}; border-bottom: 1px solid ${themeCssVariables.border.color.medium}; @media (max-width: ${MOBILE_VIEWPORT}px) { display: none; } `;

export const DataMap = () => {
  useLingui();
  const { data, loading, error } = useQuery(GET_DATA_RESIDENCY_ANALYTICS);
  if (loading) return <StyledContainer>{t`Loading...`}</StyledContainer>;
  if (error) return <StyledContainer>{t`Error loading data`}</StyledContainer>;
  const locations: DataLocationData[] = data?.dataresidencyAnalytics?.locations ?? [];
  return (
    <StyledContainer>
      <StyledTitle>{t`Data Location Overview`}</StyledTitle>
      <StyledTable>
        <thead><tr><StyledTh>{t`Data Type`}</StyledTh><StyledTh>{t`Region`}</StyledTh><StyledTh>{t`Records`}</StyledTh><StyledRHH>{t`Size (GB)`}</StyledRHH><StyledRHH>{t`Last Synced`}</StyledRHH></tr></thead>
        <tbody>{locations.map((l) => (<tr key={l.id}><StyledTd>{l.dataType}</StyledTd><StyledTd>{l.region}</StyledTd><StyledTd>{l.recordCount.toLocaleString()}</StyledTd><StyledRH>{l.sizeGb}</StyledRH><StyledRH>{new Date(l.lastSyncedAt).toLocaleString()}</StyledRH></tr>))}</tbody>
      </StyledTable>
    </StyledContainer>
  );
};
