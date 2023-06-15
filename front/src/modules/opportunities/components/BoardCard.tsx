import styled from '@emotion/styled';

import { Company, Person } from '../../../generated/graphql';
import CompanyChip from '../../companies/components/CompanyChip';
import PersonPlaceholder from '../../people/components/person-placeholder.png';
import { PersonChip } from '../../people/components/PersonChip';
import {
  IconBuildingSkyscraper,
  IconCalendar,
  IconMail,
  IconPhone,
  IconUsers,
  IconUser,
} from '../../ui/icons';
import { getLogoUrlFromDomainName, humanReadableDate } from '../../utils/utils';

const StyledBoardCard = styled.div`
  color: ${(props) => props.theme.text80};
`;

const StyledBoardCardHeader = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  font-weight: ${(props) => props.theme.fontWeightBold};
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
      color: ${(props) => props.theme.text40};
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
  const fullname = `${person.firstname} ${person.lastname}`;
  return (
    <StyledBoardCard>
      <StyledBoardCardHeader>
        <img
          data-testid="person-chip-image"
          src={PersonPlaceholder.toString()}
          alt="person"
        />
        {fullname}
      </StyledBoardCardHeader>
      <StyledBoardCardBody>
        <span>
          <IconBuildingSkyscraper size={16} />
          <CompanyChip
            name={person.company?.name || ''}
            picture={getLogoUrlFromDomainName(
              person.company?.domainName,
            ).toString()}
          />
        </span>
        <span>
          <IconMail size={16} />
          {person.email}
        </span>
        <span>
          <IconPhone size={16} />
          {person.phone}
        </span>
        <span>
          <IconCalendar size={16} />
          {humanReadableDate(new Date(person.createdAt as string))}
        </span>
      </StyledBoardCardBody>
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
          <IconUsers size={16} /> {company.employees}
        </span>
        <span>
          <IconCalendar size={16} />
          {humanReadableDate(new Date(company.createdAt as string))}
        </span>
      </StyledBoardCardBody>
    </StyledBoardCard>
  );
};
