import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { DeliveryData, DeliveryStatus } from '../types/fleet.types';

const MOCK_DELIVERIES: DeliveryData[] = [
  { id: 'D1', orderId: 'ORD-5001', vehicleId: 'V1', driver: 'Juan Perez', origin: 'Depot Central', destination: 'Cliente Bogota Norte', status: 'in_transit', estimatedArrival: '2026-04-29T14:00:00Z', events: [
    { timestamp: '2026-04-29T08:00:00Z', status: 'pending', location: 'Depot Central' },
    { timestamp: '2026-04-29T09:30:00Z', status: 'picked_up', location: 'Depot Central' },
    { timestamp: '2026-04-29T11:00:00Z', status: 'in_transit', location: 'Autopista Norte Km 15' },
  ]},
  { id: 'D2', orderId: 'ORD-5002', vehicleId: 'V4', driver: 'Luis Reyes', origin: 'Depot Sur', destination: 'Cliente Cali', status: 'delivered', estimatedArrival: '2026-04-28T16:00:00Z', events: [
    { timestamp: '2026-04-28T07:00:00Z', status: 'pending', location: 'Depot Sur' },
    { timestamp: '2026-04-28T08:00:00Z', status: 'picked_up', location: 'Depot Sur' },
    { timestamp: '2026-04-28T12:00:00Z', status: 'in_transit', location: 'Via Panamericana' },
    { timestamp: '2026-04-28T15:30:00Z', status: 'delivered', location: 'Cliente Cali' },
  ]},
];

const STATUS_COLORS: Record<DeliveryStatus, string> = {
  pending: themeCssVariables.color.gray50,
  picked_up: themeCssVariables.color.yellow,
  in_transit: themeCssVariables.color.blue,
  delivered: themeCssVariables.color.turquoise,
  failed: themeCssVariables.color.red,
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[4]};
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledTitle = styled.h2`
  font-size: ${themeCssVariables.font.size.lg};
  color: ${themeCssVariables.font.color.primary};
  margin: 0;
`;

const StyledDelivery = styled.div`
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 8px;
  padding: ${themeCssVariables.spacing[3]};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledHeader = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    flex-direction: column;
  }
`;

const StyledOrderId = styled.span`
  font-weight: ${themeCssVariables.font.weight.medium};
  font-size: ${themeCssVariables.font.size.md};
  color: ${themeCssVariables.font.color.primary};
`;

const StyledRoute = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.secondary};
`;

const StyledTimeline = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  padding-left: ${themeCssVariables.spacing[3]};
  border-left: 2px solid ${themeCssVariables.border.color.medium};
`;

const StyledEvent = styled.div`
  display: flex;
  align-items: center;
  gap: ${themeCssVariables.spacing[2]};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledDot = styled.span<{ color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ color }) => color};
  margin-left: -19px;
  flex-shrink: 0;
`;

const StyledEventTime = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  min-width: 50px;
`;

const StyledEventLocation = styled.span`
  color: ${themeCssVariables.font.color.primary};
`;

export const DeliveryTracker = () => {
  useLingui();

  return (
    <StyledContainer>
      <StyledTitle>{t`Delivery Tracking`}</StyledTitle>
      {MOCK_DELIVERIES.map((delivery) => (
        <StyledDelivery key={delivery.id}>
          <StyledHeader>
            <StyledOrderId>{delivery.orderId}</StyledOrderId>
            <StyledRoute>{delivery.origin} → {delivery.destination}</StyledRoute>
          </StyledHeader>
          <StyledTimeline>
            {delivery.events.map((event, index) => (
              <StyledEvent key={index}>
                <StyledDot color={STATUS_COLORS[event.status]} />
                <StyledEventTime>{new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</StyledEventTime>
                <StyledEventLocation>{event.location}</StyledEventLocation>
              </StyledEvent>
            ))}
          </StyledTimeline>
        </StyledDelivery>
      ))}
    </StyledContainer>
  );
};
