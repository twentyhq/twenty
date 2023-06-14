import styled from '@emotion/styled';

import { Company, Person } from '../../../generated/graphql';

const StyledBoardCard = styled.p`
  color: ${(props) => props.theme.text80};
`;

export const BoardCard = ({ item }: { item: Person | Company }) => {
  if (item.__typename === 'Person') return <PersonBoardCard person={item} />;
  if (item.__typename === 'Company') return <CompanyBoardCard company={item} />;
  // @todo return card skeleton
  return null;
};

const PersonBoardCard = ({ person }: { person: Person }) => {
  return (
    <StyledBoardCard>{`${person.firstname} ${person.lastname}`}</StyledBoardCard>
  );
};

const CompanyBoardCard = ({ company }: { company: Company }) => {
  return <StyledBoardCard>{company.name}</StyledBoardCard>;
};
