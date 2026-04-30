import { useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { PRStatus, PurchaseRequest } from '../types/procurement.types';
import { GET_PURCHASE_REQUESTS } from '../hooks/useProcurement';

const STATUS_COLORS: Record<PRStatus, string> = {
  draft: themeCssVariables.color.gray50,
  submitted: themeCssVariables.color.yellow,
  approved: themeCssVariables.color.turquoise,
  rejected: themeCssVariables.color.red,
  ordered: themeCssVariables.color.blue,
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

export const PurchaseRequestList = () => {
  useLingui();
  const { data, loading, error } = useQuery(GET_PURCHASE_REQUESTS);

  if (loading) return <StyledContainer>{t`Loading...`}</StyledContainer>;
  if (error) return <StyledContainer>{t`Error loading data`}</StyledContainer>;

  const prs: PurchaseRequest[] = data?.purchaseRequests?.edges?.map((e: { node: PurchaseRequest }) => e.node) ?? [];

  return (
    <StyledContainer>
      <StyledTitle>{t`Purchase Requests`}</StyledTitle>
      <StyledTable>
        <thead>
          <tr>
            <StyledTh>{t`ID`}</StyledTh>
            <StyledTh>{t`Title`}</StyledTh>
            <StyledTh>{t`Status`}</StyledTh>
            <StyledTh>{t`Amount`}</StyledTh>
            <StyledHideMobileHeader>{t`Requester`}</StyledHideMobileHeader>
            <StyledHideMobileHeader>{t`Approver`}</StyledHideMobileHeader>
          </tr>
        </thead>
        <tbody>
          {prs.map((pr) => (
            <tr key={pr.id}>
              <StyledTd>{pr.id}</StyledTd>
              <StyledTd>{pr.title}</StyledTd>
              <StyledTd>
                <StyledBadge color={STATUS_COLORS[pr.status]}>{pr.status}</StyledBadge>
              </StyledTd>
              <StyledTd>${pr.totalAmount.toLocaleString()}</StyledTd>
              <StyledHideMobile>{pr.requester}</StyledHideMobile>
              <StyledHideMobile>{pr.approver}</StyledHideMobile>
            </tr>
          ))}
        </tbody>
      </StyledTable>
    </StyledContainer>
  );
};
