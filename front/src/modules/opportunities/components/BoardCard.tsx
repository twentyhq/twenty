import styled from '@emotion/styled';

import { Company, Person } from '../../../generated/graphql';
import { PersonChip } from '../../people/components/PersonChip';
import { IconCalendar, IconSum, IconUser } from '../../ui/icons';
import { getLogoUrlFromDomainName, humanReadableDate } from '../../utils/utils';

const StyledBoardCard = styled.div`
  color: ${(props) => props.theme.text80};
`;

const StyledBoardCardHeader = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  height: 24px;
  padding: ${(props) => props.theme.spacing(2)};
  img {
    height: 16px;
    margin-right: ${(props) => props.theme.spacing(2)};
    object-fit: cover;
    width: 16px;
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
      margin-right: ${(props) => props.theme.spacing(2)};
    }
  }
`;

export const BoardCard = ({ item }: { item: Person | Company }) => {
  if (item.__typename === 'Person') return <PersonBoardCard person={item} />;
  if (item.__typename === 'Company') return <CompanyBoardCard company={item} />;
  // @todo return card skeleton
  return null;
};

const PersonBoardCard = ({ person }: { person: Person }) => {
  return (
    <StyledBoardCard>
      <StyledBoardCardHeader>
        <span>{`${person.firstname} ${person.lastname}`}</span>
      </StyledBoardCardHeader>
    </StyledBoardCard>
  );
};

const CompanyBoardCard = ({ company }: { company: Company }) => {
  return (
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
          <IconUser size={16} />
          <PersonChip name={company.accountOwner?.displayName || ''} />
        </span>
        <span>
          <IconSum size={16} /> {company.employees}
        </span>
        <span>
          <IconCalendar size={16} />
          {humanReadableDate(new Date(company.createdAt as string))}
        </span>
      </StyledBoardCardBody>
    </StyledBoardCard>
  );
};
