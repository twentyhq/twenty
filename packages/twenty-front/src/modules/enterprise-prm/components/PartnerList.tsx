import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { PartnerData, PartnerTier } from '../types/prm.types';

const MOCK_PARTNERS: PartnerData[] = [
  { id: 'PR1', companyName: 'TechSolutions CO', contactName: 'Juan Perez', tier: 'platinum', dealCount: 15, revenue: 2500000, currency: 'COP', region: 'LATAM', joinedAt: '2022-03-10' },
  { id: 'PR2', companyName: 'DataPros Inc', contactName: 'Laura Jimenez', tier: 'gold', dealCount: 8, revenue: 1200000, currency: 'COP', region: 'NA', joinedAt: '2023-07-15' },
  { id: 'PR3', companyName: 'CloudFirst SAS', contactName: 'Pedro Ruiz', tier: 'silver', dealCount: 3, revenue: 350000, currency: 'COP', region: 'LATAM', joinedAt: '2024-01-20' },
  { id: 'PR4', companyName: 'Innovate LLC', contactName: 'Sofia Garcia', tier: 'registered', dealCount: 0, revenue: 0, currency: 'COP', region: 'EMEA', joinedAt: '2026-02-01' },
];

const TIER_COLORS: Record<PartnerTier, string> = {
  registered: themeCssVariables.color.gray50,
  silver: themeCssVariables.color.gray50,
  gold: themeCssVariables.color.yellow,
  platinum: themeCssVariables.color.blue,
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
  background: ${({ color }) => color};
  color: ${themeCssVariables.font.color.inverted};
`;

const StyledHideMobile = styled.td`
  padding: ${themeCssVariables.spacing[2]};
  font-size: ${themeCssVariables.font.size.md};
  color: ${themeCssVariables.font.color.primary};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  @media (max-width: ${MOBILE_VIEWPORT}px) { display: none; }
`;

const StyledHideMobileHeader = styled.th`
  text-align: left;
  padding: ${themeCssVariables.spacing[2]};
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.tertiary};
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  @media (max-width: ${MOBILE_VIEWPORT}px) { display: none; }
`;

export const PartnerList = () => {
  useLingui();

  return (
    <StyledContainer>
      <StyledTitle>{t`Partners`}</StyledTitle>
      <StyledTable>
        <thead>
          <tr>
            <StyledTh>{t`Company`}</StyledTh>
            <StyledTh>{t`Tier`}</StyledTh>
            <StyledTh>{t`Deals`}</StyledTh>
            <StyledHideMobileHeader>{t`Revenue`}</StyledHideMobileHeader>
            <StyledHideMobileHeader>{t`Region`}</StyledHideMobileHeader>
          </tr>
        </thead>
        <tbody>
          {MOCK_PARTNERS.map((partner) => (
            <tr key={partner.id}>
              <StyledTd>{partner.companyName}</StyledTd>
              <StyledTd>
                <StyledBadge color={TIER_COLORS[partner.tier]}>{partner.tier}</StyledBadge>
              </StyledTd>
              <StyledTd>{partner.dealCount}</StyledTd>
              <StyledHideMobile>${partner.revenue.toLocaleString()}</StyledHideMobile>
              <StyledHideMobile>{partner.region}</StyledHideMobile>
            </tr>
          ))}
        </tbody>
      </StyledTable>
    </StyledContainer>
  );
};
