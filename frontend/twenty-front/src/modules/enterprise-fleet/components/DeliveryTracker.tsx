import { useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { DeliveryData, DeliveryStatus } from '../types/fleet.types';
import { GET_FLEET_ANALYTICS } from '../hooks/useFleet';

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

  const { data, loading, error } = useQuery(GET_FLEET_ANALYTICS);

  if (loading) return <StyledContainer>{t`Loading...`}</StyledContainer>;
  if (error) return <StyledContainer>{t`Error loading data`}</StyledContainer>;

  const deliveries: DeliveryData[] = data?.fleetAnalytics?.deliveries ?? [];

  return (
    <StyledContainer>
      <StyledTitle>{t`Delivery Tracking`}</StyledTitle>
      {deliveries.map((delivery) => (
        <StyledDelivery key={delivery.id}>
          <StyledHeader>
            <StyledOrderId>{delivery.orderId}</StyledOrderId>
            <StyledRoute>{delivery.origin} → {delivery.destination}</StyledRoute>
          </StyledHeader>
          <StyledTimeline>
            {delivery.events?.map((event, index) => (
              <StyledEvent key={index}>
                <StyledDot color={STATUS_COLORS[event.status] ?? themeCssVariables.color.gray50} />
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
