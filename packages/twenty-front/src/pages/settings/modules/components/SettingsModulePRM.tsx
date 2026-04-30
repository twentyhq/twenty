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

const StyledFormRow = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  align-items: flex-end;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

type PartnerTier = {
  name: string;
  commissionRate: string;
  partnersCount: number;
  annualRevenue: string;
};

type LeaderboardEntry = {
  rank: number;
  partner: string;
  tier: string;
  dealsRegistered: number;
  revenue: string;
};

export const SettingsModulePRM = () => {
  const { t } = useLingui();

  const [exclusivityDays, setExclusivityDays] = useState('30');
  const [conflictResolution, setConflictResolution] = useState('first_registered');
  const [mdfBudget, setMdfBudget] = useState('500000000');

  const [tiers] = useState<PartnerTier[]>([
    { name: 'Gold', commissionRate: '25%', partnersCount: 5, annualRevenue: '$2.1B COP' },
    { name: 'Silver', commissionRate: '18%', partnersCount: 12, annualRevenue: '$890M COP' },
    { name: 'Bronze', commissionRate: '12%', partnersCount: 28, annualRevenue: '$340M COP' },
  ]);

  const [leaderboard] = useState<LeaderboardEntry[]>([
    { rank: 1, partner: 'TechPartners CO', tier: 'Gold', dealsRegistered: 47, revenue: '$850M' },
    { rank: 2, partner: 'SolucionesDigitales', tier: 'Gold', dealsRegistered: 38, revenue: '$720M' },
    { rank: 3, partner: 'InnovateCO', tier: 'Silver', dealsRegistered: 31, revenue: '$410M' },
    { rank: 4, partner: 'CloudExperts', tier: 'Silver', dealsRegistered: 25, revenue: '$380M' },
    { rank: 5, partner: 'DataSolutions', tier: 'Bronze', dealsRegistered: 18, revenue: '$210M' },
  ]);

  return (
    <SubMenuTopBarContainer
      title={t`Partner Management`}
      links={[
        { children: t`Modules`, href: getSettingsPath(SettingsPath.EnterpriseModules) },
        { children: t`Partner Management` },
      ]}
    >
      <StyledContainer>
        <StyledTitle>{t`Partner Relationship Management`}</StyledTitle>

        <StyledSection>
          <StyledSectionTitle>{t`Partner Tier Definitions`}</StyledSectionTitle>
          <StyledTable>
            <thead>
              <tr>
                <StyledTh>{t`Tier`}</StyledTh>
                <StyledTh>{t`Commission Rate`}</StyledTh>
                <StyledTh>{t`Partners`}</StyledTh>
                <StyledTh>{t`Annual Revenue`}</StyledTh>
              </tr>
            </thead>
            <tbody>
              {tiers.map((tier) => (
                <tr key={tier.name}>
                  <StyledTd>{tier.name}</StyledTd>
                  <StyledTd>{tier.commissionRate}</StyledTd>
                  <StyledTd>{tier.partnersCount}</StyledTd>
                  <StyledTd>{tier.annualRevenue}</StyledTd>
                </tr>
              ))}
            </tbody>
          </StyledTable>
        </StyledSection>

        <StyledSection>
          <StyledSectionTitle>{t`Deal Registration Settings`}</StyledSectionTitle>
          <StyledFormRow>
            <StyledFormGroup style={{ flex: 1 }}>
              <StyledLabel>{t`Exclusivity Period (days)`}</StyledLabel>
              <StyledInput
                type="number"
                value={exclusivityDays}
                onChange={(event) => setExclusivityDays(event.target.value)}
              />
            </StyledFormGroup>
            <StyledFormGroup style={{ flex: 1 }}>
              <StyledLabel>{t`Conflict Resolution`}</StyledLabel>
              <StyledSelect
                value={conflictResolution}
                onChange={(event) => setConflictResolution(event.target.value)}
              >
                <option value="first_registered">{t`First Registered`}</option>
                <option value="highest_tier">{t`Highest Tier Priority`}</option>
                <option value="manual">{t`Manual Review`}</option>
              </StyledSelect>
            </StyledFormGroup>
          </StyledFormRow>
        </StyledSection>

        <StyledSection>
          <StyledSectionTitle>{t`MDF Budget Allocation`}</StyledSectionTitle>
          <StyledFormGroup>
            <StyledLabel>{t`Total MDF Budget (COP)`}</StyledLabel>
            <StyledInput
              type="number"
              value={mdfBudget}
              onChange={(event) => setMdfBudget(event.target.value)}
            />
          </StyledFormGroup>
          <StyledStatGrid>
            <StyledStatCard>
              <StyledStatValue>$500M</StyledStatValue>
              <StyledStatLabel>{t`Total budget`}</StyledStatLabel>
            </StyledStatCard>
            <StyledStatCard>
              <StyledStatValue>$320M</StyledStatValue>
              <StyledStatLabel>{t`Allocated`}</StyledStatLabel>
            </StyledStatCard>
            <StyledStatCard>
              <StyledStatValue>$180M</StyledStatValue>
              <StyledStatLabel>{t`Available`}</StyledStatLabel>
            </StyledStatCard>
            <StyledStatCard>
              <StyledStatValue>64%</StyledStatValue>
              <StyledStatLabel>{t`Utilization`}</StyledStatLabel>
            </StyledStatCard>
          </StyledStatGrid>
        </StyledSection>

        <StyledSection>
          <StyledSectionTitle>{t`Partner Leaderboard`}</StyledSectionTitle>
          <StyledTable>
            <thead>
              <tr>
                <StyledTh>{t`Rank`}</StyledTh>
                <StyledTh>{t`Partner`}</StyledTh>
                <StyledTh>{t`Tier`}</StyledTh>
                <StyledTh>{t`Deals`}</StyledTh>
                <StyledTh>{t`Revenue`}</StyledTh>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry) => (
                <tr key={entry.rank}>
                  <StyledTd>#{entry.rank}</StyledTd>
                  <StyledTd>{entry.partner}</StyledTd>
                  <StyledTd>{entry.tier}</StyledTd>
                  <StyledTd>{entry.dealsRegistered}</StyledTd>
                  <StyledTd>{entry.revenue}</StyledTd>
                </tr>
              ))}
            </tbody>
          </StyledTable>
        </StyledSection>

        <StyledButton>{t`Save Settings`}</StyledButton>
      </StyledContainer>
    </SubMenuTopBarContainer>
  );
};
