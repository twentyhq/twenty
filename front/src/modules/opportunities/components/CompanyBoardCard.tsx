import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { Company } from '../../../generated/graphql';
import { PersonChip } from '../../people/components/PersonChip';
import { IconCalendarEvent, IconUser, IconUsers } from '../../ui/icons';
import { getLogoUrlFromDomainName, humanReadableDate } from '../../utils/utils';

const StyledBoardCard = styled.div`
  background: ${({ theme }) => theme.secondaryBackground};
  border: 1px solid ${({ theme }) => theme.mediumBorder};
  border-radius: 4px;
  box-shadow: ${({ theme }) => theme.lightBoxShadow};
  color: ${({ theme }) => theme.text80};
  cursor: pointer;
`;

const StyledBoardCardWrapper = styled.div`
  padding-bottom: ${(props) => props.theme.spacing(2)};
`;

const StyledBoardCardHeader = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  font-weight: ${(props) => props.theme.fontWeightBold};
  height: 24px;
  padding-left: ${(props) => props.theme.spacing(2)};
  padding-right: ${(props) => props.theme.spacing(2)};
  padding-top: ${(props) => props.theme.spacing(2)};
  img {
    height: ${(props) => props.theme.iconSizeMedium}px;
    margin-right: ${(props) => props.theme.spacing(2)};
    object-fit: cover;
    width: ${(props) => props.theme.iconSizeMedium}px;
  }
`;
const StyledBoardCardBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing(2)};
  padding: ${(props) => props.theme.spacing(2)};
  span {
    align-items: center;
    display: flex;
    flex-direction: row;
    svg {
      color: ${(props) => props.theme.text40};
      margin-right: ${(props) => props.theme.spacing(2)};
    }
  }
`;

type CompanyProp = Pick<
  Company,
  'id' | 'name' | 'domainName' | 'employees' | 'createdAt' | 'accountOwner'
>;

export function CompanyBoardCard({ company }: { company: CompanyProp }) {
  const theme = useTheme();
  return (
    <StyledBoardCardWrapper>
      <StyledBoardCard>
        <StyledBoardCardHeader>
          <img
            src={getLogoUrlFromDomainName(company.domainName).toString()}
            alt={`${company.name}-company-logo`}
          />
          <span>{company.name}</span>
        </StyledBoardCardHeader>
        <StyledBoardCardBody>
          <span>
            <IconUser size={theme.iconSizeMedium} />
            <PersonChip name={company.accountOwner?.displayName || ''} />
          </span>
          <span>
            <IconUsers size={theme.iconSizeMedium} /> {company.employees}
          </span>
          <span>
            <IconCalendarEvent size={theme.iconSizeMedium} />
            {humanReadableDate(new Date(company.createdAt as string))}
          </span>
        </StyledBoardCardBody>
      </StyledBoardCard>
    </StyledBoardCardWrapper>
  );
}
