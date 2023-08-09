import styled from '@emotion/styled';

import { PeopleCard } from '@/people/components/PeopleCard';
import { Company, useGetPeopleQuery } from '~/generated/graphql';

export type CompanyTeamPropsType = {
  company: Pick<Company, 'id'>;
};

const StyledContainer = styled.div`
  align-items: flex-start;
  align-self: stretch;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledTitleContainer = styled.div`
  align-items: center;
  align-self: stretch;
  backdrop-filter: blur(5px);
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  justify-content: space-between;
  padding: 12px 12px 0px 12px;
`;

const StyledListContainer = styled.div`
  align-items: flex-start;
  align-self: stretch;
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.spacing(1)};
  display: flex;
  flex-direction: column;
`;

const StyledTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-family: Inter;
  font-size: 13px;

  font-style: normal;
  font-weight: 500;
  line-height: 150%;
`;

export function CompanyTeam({ company }: CompanyTeamPropsType) {
  const { data } = useGetPeopleQuery({
    variables: {
      orderBy: [],
      where: {
        companyId: {
          equals: company.id,
        },
      },
    },
  });

  return (
    <StyledContainer>
      <StyledTitleContainer>
        <StyledTitle>Team</StyledTitle>
      </StyledTitleContainer>
      <StyledListContainer>
        {data?.people?.map((person) => {
          return <PeopleCard key={person.id} person={person} />;
        })}
      </StyledListContainer>
    </StyledContainer>
  );
}
