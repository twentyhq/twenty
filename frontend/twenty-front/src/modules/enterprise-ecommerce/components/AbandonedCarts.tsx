import { useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { TRACK_ABANDONED_CART } from '../hooks/useECommerce';
import { AbandonedCartData } from '../types/ecommerce.types';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[4]};
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledTitle = styled.h2`
  font-size: ${themeCssVariables.font.size.lg};
  color: ${themeCssVariables.font.color.primary};
  margin: 0;
`;

const StyledStats = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[4]};
  flex-wrap: wrap;
`;

const StyledStat = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const StyledStatLabel = styled.span`
  font-size: ${themeCssVariables.font.size.xs};
  color: ${themeCssVariables.font.color.tertiary};
  text-transform: uppercase;
`;

const StyledStatValue = styled.span`
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.medium};
  color: ${themeCssVariables.font.color.primary};
`;

const StyledGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: ${themeCssVariables.spacing[3]};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: 1fr;
  }
`;

const StyledCard = styled.div`
  padding: ${themeCssVariables.spacing[3]};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledEmail = styled.span`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  color: ${themeCssVariables.font.color.primary};
`;

const StyledDetail = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.secondary};
`;

const StyledRecoveryBadge = styled.span<{ recovered: boolean }>`
  font-size: ${themeCssVariables.font.size.xs};
  padding: 2px 6px;
  border-radius: 4px;
  align-self: flex-start;
  background: ${({ recovered }) =>
    recovered ? themeCssVariables.color.turquoise : themeCssVariables.color.orange};
  color: ${themeCssVariables.font.color.inverted};
`;

const StyledError = styled.div`
  color: ${themeCssVariables.color.red};
  padding: ${themeCssVariables.spacing[4]};
`;

export const AbandonedCarts = () => {
  useLingui();

  const { data, loading, error } = useQuery(TRACK_ABANDONED_CART);

  if (loading) {
    return (
      <StyledContainer>
        <StyledTitle>{t`Abandoned Carts`}</StyledTitle>
        <StyledDetail>{t`Loading...`}</StyledDetail>
      </StyledContainer>
    );
  }

  if (error) {
    return (
      <StyledContainer>
        <StyledTitle>{t`Abandoned Carts`}</StyledTitle>
        <StyledError>{t`Error loading abandoned carts`}: {error.message}</StyledError>
      </StyledContainer>
    );
  }

  const carts: AbandonedCartData[] =
    data?.abandonedCarts?.edges?.map(
      (edge: { node: AbandonedCartData }) => edge.node,
    ) ?? [];

  const totalValue = carts.reduce((sum, cart) => sum + cart.cartValue, 0);
  const recoveredCount = carts.filter((cart) => cart.recovered).length;

  return (
    <StyledContainer>
      <StyledTitle>{t`Abandoned Carts`}</StyledTitle>
      <StyledStats>
        <StyledStat>
          <StyledStatLabel>{t`Total Carts`}</StyledStatLabel>
          <StyledStatValue>{carts.length}</StyledStatValue>
        </StyledStat>
        <StyledStat>
          <StyledStatLabel>{t`Total Value`}</StyledStatLabel>
          <StyledStatValue>${totalValue.toLocaleString()}</StyledStatValue>
        </StyledStat>
        <StyledStat>
          <StyledStatLabel>{t`Recovered`}</StyledStatLabel>
          <StyledStatValue>{recoveredCount}/{carts.length}</StyledStatValue>
        </StyledStat>
      </StyledStats>
      <StyledGrid>
        {carts.map((cart) => (
          <StyledCard key={cart.id}>
            <StyledEmail>{cart.customerEmail}</StyledEmail>
            <StyledDetail>{cart.itemCount} {t`items`} - ${cart.cartValue.toLocaleString()}</StyledDetail>
            <StyledDetail>{new Date(cart.abandonedAt).toLocaleString()}</StyledDetail>
            <StyledRecoveryBadge recovered={cart.recovered}>
              {cart.recovered ? t`Recovered` : cart.recoveryEmailSent ? t`Email Sent` : t`Pending`}
            </StyledRecoveryBadge>
          </StyledCard>
        ))}
      </StyledGrid>
    </StyledContainer>
  );
};
