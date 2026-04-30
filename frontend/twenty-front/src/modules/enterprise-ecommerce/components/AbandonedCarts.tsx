import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { AbandonedCartData } from '../types/ecommerce.types';

const MOCK_CARTS: AbandonedCartData[] = [
  { id: 'AC1', customerEmail: 'juan@email.com', itemCount: 3, cartValue: 320000, currency: 'COP', abandonedAt: '2026-04-29T07:30:00Z', recoveryEmailSent: true, recovered: false },
  { id: 'AC2', customerEmail: 'laura@email.com', itemCount: 1, cartValue: 89000, currency: 'COP', abandonedAt: '2026-04-28T20:00:00Z', recoveryEmailSent: true, recovered: true },
  { id: 'AC3', customerEmail: 'diego@email.com', itemCount: 5, cartValue: 750000, currency: 'COP', abandonedAt: '2026-04-29T09:15:00Z', recoveryEmailSent: false, recovered: false },
  { id: 'AC4', customerEmail: 'camila@email.com', itemCount: 2, cartValue: 145000, currency: 'COP', abandonedAt: '2026-04-28T14:00:00Z', recoveryEmailSent: true, recovered: false },
];

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

export const AbandonedCarts = () => {
  useLingui();

  const totalValue = MOCK_CARTS.reduce((sum, cart) => sum + cart.cartValue, 0);
  const recoveredCount = MOCK_CARTS.filter((cart) => cart.recovered).length;

  return (
    <StyledContainer>
      <StyledTitle>{t`Abandoned Carts`}</StyledTitle>
      <StyledStats>
        <StyledStat>
          <StyledStatLabel>{t`Total Carts`}</StyledStatLabel>
          <StyledStatValue>{MOCK_CARTS.length}</StyledStatValue>
        </StyledStat>
        <StyledStat>
          <StyledStatLabel>{t`Total Value`}</StyledStatLabel>
          <StyledStatValue>${totalValue.toLocaleString()}</StyledStatValue>
        </StyledStat>
        <StyledStat>
          <StyledStatLabel>{t`Recovered`}</StyledStatLabel>
          <StyledStatValue>{recoveredCount}/{MOCK_CARTS.length}</StyledStatValue>
        </StyledStat>
      </StyledStats>
      <StyledGrid>
        {MOCK_CARTS.map((cart) => (
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
