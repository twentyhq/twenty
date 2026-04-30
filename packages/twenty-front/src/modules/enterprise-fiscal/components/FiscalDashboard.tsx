import { useState } from 'react';

import { styled } from '@linaria/atomic';

import {
  FiscalCountry,
  FiscalCountryStats,
  CertificateStatus,
} from '../types/fiscal.types';

type FiscalDashboardProps = {
  countryStats: FiscalCountryStats[];
};

const COUNTRY_NAMES: Record<FiscalCountry, string> = {
  CO: 'Colombia',
  MX: 'Mexico',
  CL: 'Chile',
  PE: 'Peru',
  AR: 'Argentina',
  BR: 'Brazil',
  EC: 'Ecuador',
};

const CERT_STATUS_COLORS: Record<CertificateStatus, string> = {
  valid: '#22c55e',
  expiring_soon: '#f59e0b',
  expired: '#ef4444',
  not_configured: '#94a3b8',
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const TabsRow = styled.div`
  display: flex;
  gap: 4px;
  border-bottom: 1px solid #e5e7eb;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 8px 16px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 13px;
  font-weight: ${(props) => (props.active ? '600' : '400')};
  color: ${(props) => (props.active ? '#3b82f6' : '#6b7280')};
  border-bottom: 2px solid
    ${(props) => (props.active ? '#3b82f6' : 'transparent')};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
`;

const StatCard = styled.div`
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 700;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #6b7280;
`;

const CertBadge = styled.span<{ color: string }>`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  color: white;
  background: ${(props) => props.color};
`;

export const FiscalDashboard = ({ countryStats }: FiscalDashboardProps) => {
  const [selectedCountry, setSelectedCountry] = useState<FiscalCountry>(
    countryStats[0]?.country ?? 'CO',
  );

  const currentStats = countryStats.find(
    (stats) => stats.country === selectedCountry,
  );

  return (
    <Container>
      <TabsRow>
        {countryStats.map((stats) => (
          <Tab
            key={stats.country}
            active={stats.country === selectedCountry}
            onClick={() => setSelectedCountry(stats.country)}
          >
            {COUNTRY_NAMES[stats.country]}
          </Tab>
        ))}
      </TabsRow>

      {currentStats !== undefined && (
        <>
          <StatsGrid>
            <StatCard>
              <StatValue>{currentStats.totalInvoices}</StatValue>
              <StatLabel>Total Invoices</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{currentStats.accepted}</StatValue>
              <StatLabel>Accepted</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{currentStats.rejected}</StatValue>
              <StatLabel>Rejected</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{currentStats.pending}</StatValue>
              <StatLabel>Pending</StatLabel>
            </StatCard>
          </StatsGrid>

          <div>
            Certificate:{' '}
            <CertBadge
              color={CERT_STATUS_COLORS[currentStats.certificateStatus]}
            >
              {currentStats.certificateStatus.replace('_', ' ')}
            </CertBadge>
            {currentStats.lastSyncAt !== null && (
              <span style={{ marginLeft: '12px', fontSize: '12px', color: '#6b7280' }}>
                Last sync:{' '}
                {new Date(currentStats.lastSyncAt).toLocaleString()}
              </span>
            )}
          </div>
        </>
      )}
    </Container>
  );
};
