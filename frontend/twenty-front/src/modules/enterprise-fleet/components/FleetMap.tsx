import { useMutation, useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { useState } from 'react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import {
  CREATE_DELIVERY,
  GET_DRIVER_PERFORMANCE,
  GET_FLEET_ANALYTICS,
} from '../hooks/useFleet';
import { VehicleStatus } from '../types/fleet.types';

const STATUS_COLORS: Record<VehicleStatus, string> = {
  available: themeCssVariables.color.turquoise,
  in_transit: themeCssVariables.color.blue,
  maintenance: themeCssVariables.color.yellow,
  offline: themeCssVariables.color.red,
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[4]};
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledToolbar = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  flex-wrap: wrap;
  align-items: center;
`;

const StyledButton = styled.button`
  padding: 6px 14px;
  border: none;
  border-radius: 4px;
  background: ${themeCssVariables.color.blue};
  color: ${themeCssVariables.font.color.inverted};
  cursor: pointer;
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledInput = styled.input`
  padding: 6px 10px;
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 4px;
  font-size: ${themeCssVariables.font.size.sm};
  min-width: 120px;
`;

const StyledForm = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  flex-wrap: wrap;
  padding: ${themeCssVariables.spacing[3]};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 8px;
`;

const StyledMetrics = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.secondary};
  flex-wrap: wrap;
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

const StyledDot = styled.span<{ color: string }>`
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${({ color }) => color};
  margin-right: 6px;
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
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    display: none;
  }
`;

const StyledHideMobileHeader = styled.th`
  text-align: left;
  padding: ${themeCssVariables.spacing[2]};
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.tertiary};
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    display: none;
  }
`;

const StyledLoading = styled.div`
  padding: ${themeCssVariables.spacing[4]};
  color: ${themeCssVariables.font.color.tertiary};
`;

const StyledError = styled.div`
  padding: ${themeCssVariables.spacing[4]};
  color: ${themeCssVariables.color.red};
`;

export const FleetMap = () => {
  useLingui();

  const [showForm, setShowForm] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [destination, setDestination] = useState('');

  const { data, loading, error, refetch } = useQuery(GET_FLEET_ANALYTICS);
  const { data: driverData } = useQuery(GET_DRIVER_PERFORMANCE, {
    variables: {},
  });

  const [createDelivery, { loading: creating }] = useMutation(
    CREATE_DELIVERY,
    { onCompleted: () => { setShowForm(false); setOrderId(''); setDestination(''); refetch(); } },
  );

  const handleCreate = () => {
    if (!orderId || !destination) return;
    createDelivery({
      variables: { input: { orderId, destination, origin: 'Warehouse' } },
    });
  };

  if (loading) return <StyledLoading>{t`Loading...`}</StyledLoading>;
  if (error) return <StyledError>{t`Error: ${error.message}`}</StyledError>;

  const analytics = data?.fleetAnalytics;
  const drivers = driverData?.driverPerformance?.drivers ?? [];

  return (
    <StyledContainer>
      <StyledToolbar>
        <StyledTitle>{t`Fleet Overview`}</StyledTitle>
        <StyledButton onClick={() => setShowForm(!showForm)}>
          {showForm ? t`Cancel` : t`New Delivery`}
        </StyledButton>
      </StyledToolbar>

      {analytics && (
        <StyledMetrics>
          <span>
            <StyledDot color={STATUS_COLORS.available} />
            {t`Available`}: {analytics.availableCount}
          </span>
          <span>
            <StyledDot color={STATUS_COLORS.in_transit} />
            {t`In Transit`}: {analytics.inTransitCount}
          </span>
          <span>
            <StyledDot color={STATUS_COLORS.maintenance} />
            {t`Maintenance`}: {analytics.maintenanceCount}
          </span>
          <span>
            {t`Deliveries`}: {analytics.totalDeliveries}
          </span>
          <span>
            {t`On-time`}: {analytics.onTimeRate}%
          </span>
        </StyledMetrics>
      )}

      {showForm && (
        <StyledForm>
          <StyledInput
            placeholder={t`Order ID`}
            value={orderId}
            onChange={(event) => setOrderId(event.target.value)}
          />
          <StyledInput
            placeholder={t`Destination`}
            value={destination}
            onChange={(event) => setDestination(event.target.value)}
          />
          <StyledButton onClick={handleCreate} disabled={creating}>
            {creating ? t`Creating...` : t`Dispatch`}
          </StyledButton>
        </StyledForm>
      )}

      <StyledTable>
        <thead>
          <tr>
            <StyledTh>{t`Driver`}</StyledTh>
            <StyledTh>{t`Deliveries`}</StyledTh>
            <StyledTh>{t`On-time`}</StyledTh>
            <StyledHideMobileHeader>{t`Safety`}</StyledHideMobileHeader>
            <StyledHideMobileHeader>{t`Rating`}</StyledHideMobileHeader>
          </tr>
        </thead>
        <tbody>
          {drivers.map(
            (driver: {
              id: string;
              name: string;
              deliveriesCompleted: number;
              onTimeRate: number;
              safetyScore: number;
              customerRating: number;
            }) => (
              <tr key={driver.id}>
                <StyledTd>{driver.name}</StyledTd>
                <StyledTd>
                  <StyledBadge color={themeCssVariables.color.blue}>
                    {driver.deliveriesCompleted}
                  </StyledBadge>
                </StyledTd>
                <StyledTd>{driver.onTimeRate}%</StyledTd>
                <StyledHideMobile>{driver.safetyScore}/100</StyledHideMobile>
                <StyledHideMobile>{driver.customerRating}/5</StyledHideMobile>
              </tr>
            ),
          )}
        </tbody>
      </StyledTable>
    </StyledContainer>
  );
};
