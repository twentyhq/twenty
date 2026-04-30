import { useMutation } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { useState } from 'react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { REGISTER_DEAL } from '../hooks/usePRM';
import { DealRegistration } from '../types/prm.types';

type DealRegistrationsProps = {
  deals?: DealRegistration[];
};

const STATUS_COLORS: Record<string, string> = {
  submitted: themeCssVariables.color.yellow,
  approved: themeCssVariables.color.blue,
  rejected: themeCssVariables.color.red,
  won: themeCssVariables.color.turquoise,
  lost: themeCssVariables.color.gray50,
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

const StyledButton = styled.button`
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[4]};
  background: ${themeCssVariables.color.blue};
  color: ${themeCssVariables.font.color.inverted};
  border: none;
  border-radius: 4px;
  font-size: ${themeCssVariables.font.size.sm};
  cursor: pointer;
  align-self: flex-start;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const StyledError = styled.div`
  color: ${themeCssVariables.color.red};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledSuccess = styled.div`
  color: ${themeCssVariables.color.turquoise};
  font-size: ${themeCssVariables.font.size.sm};
`;

export const DealRegistrations = ({ deals = [] }: DealRegistrationsProps) => {
  useLingui();
  const [successMessage, setSuccessMessage] = useState('');

  const [registerDeal, { loading: registering, error }] = useMutation(REGISTER_DEAL);

  const handleRegisterDeal = async () => {
    try {
      await registerDeal({
        variables: {
          input: {
            dealName: 'New Deal',
            value: 0,
            currency: 'COP',
          },
        },
      });
      setSuccessMessage(t`Deal registered successfully`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch {
      // error captured by mutation hook
    }
  };

  return (
    <StyledContainer>
      <StyledTitle>{t`Deal Registrations`}</StyledTitle>
      <StyledButton onClick={handleRegisterDeal} disabled={registering}>
        {registering ? t`Registering...` : t`Register New Deal`}
      </StyledButton>
      {error && <StyledError>{t`Error`}: {error.message}</StyledError>}
      {successMessage && <StyledSuccess>{successMessage}</StyledSuccess>}
      <StyledTable>
        <thead>
          <tr>
            <StyledTh>{t`Deal`}</StyledTh>
            <StyledTh>{t`Partner`}</StyledTh>
            <StyledTh>{t`Status`}</StyledTh>
            <StyledHideMobileHeader>{t`Value`}</StyledHideMobileHeader>
            <StyledHideMobileHeader>{t`Expires`}</StyledHideMobileHeader>
          </tr>
        </thead>
        <tbody>
          {deals.map((deal) => (
            <tr key={deal.id}>
              <StyledTd>{deal.dealName}</StyledTd>
              <StyledTd>{deal.partnerName}</StyledTd>
              <StyledTd>
                <StyledBadge color={STATUS_COLORS[deal.status]}>{deal.status}</StyledBadge>
              </StyledTd>
              <StyledHideMobile>${deal.value.toLocaleString()}</StyledHideMobile>
              <StyledHideMobile>{deal.expiresAt}</StyledHideMobile>
            </tr>
          ))}
        </tbody>
      </StyledTable>
    </StyledContainer>
  );
};
