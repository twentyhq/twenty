import { useParams } from 'react-router-dom';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { useCompanyQuery } from '@/companies/services';
import { IconBuildingSkyscraper } from '@/ui/icons/index';
import { WithTopBarContainer } from '@/ui/layout/containers/WithTopBarContainer';

const StyledCompanyContainer = styled.div`
  align-items: center;
  align-self: stretch;
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: 8px;
  display: flex;
  flex: 1 0 0;
`;

const StyledLeftPanelContainer = styled.div`
  align-items: flex-start;
  align-self: stretch;
  background: ${({ theme }) => theme.background.secondary};
  border-radius: 8px;
  border-right: 1px solid ${({ theme }) => theme.border.color.light};
  padding: 0px ${({ theme }) => theme.spacing(3)};
  width: 320px;
`;

const StyledRightPanelContainer = styled.div`
  align-items: flex-start;
  align-self: stretch;
  display: flex;
  flex: 1 0 0;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
`;

export function ShowPageLayout({
  leftSide,
  rightSide,
  title,
  icon,
}: {
  leftSide: JSX.Element;
  rightSide: JSX.Element;
  title: string;
  icon: JSX.Element;
}) {
  const companyId = useParams().companyId ?? '';

  const { data } = useCompanyQuery(companyId);
  const company = data?.findUniqueCompany;

  const theme = useTheme();

  return (
    <WithTopBarContainer
      title={company?.name ?? ''}
      icon={<IconBuildingSkyscraper size={theme.icon.size.md} />}
    >
      <StyledCompanyContainer>
        <StyledLeftPanelContainer>{leftSide}</StyledLeftPanelContainer>
        <StyledRightPanelContainer>{rightSide}</StyledRightPanelContainer>
      </StyledCompanyContainer>
    </WithTopBarContainer>
  );
}
