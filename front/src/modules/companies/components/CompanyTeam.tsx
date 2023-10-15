import styled from '@emotion/styled';

import { PeopleCard } from '@/people/components/PeopleCard';
import { Company, useGetPeopleQuery } from '~/generated/graphql';

import { AddPersonToCompany } from './AddPersonToCompany';

export type CompanyTeamProps = {
  company: Pick<Company, 'id'>;
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledTitleContainer = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  justify-content: space-between;
  padding-bottom: ${({ theme }) => theme.spacing(0)};
  padding-top: ${({ theme }) => theme.spacing(3)};
`;

const StyledListContainer = styled.div`
  align-items: flex-start;
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.spacing(1)};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: auto;
  width: 100%;
`;

const StyledTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  line-height: ${({ theme }) => theme.text.lineHeight.lg};
`;

export const CompanyTeam = ({ company }: CompanyTeamProps) => {
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

  const peopleIds = data?.people?.map(({ id }) => id);

  return (
    <>
      {Boolean(data?.people?.length) && (
        <StyledContainer>
          <StyledTitleContainer>
            <StyledTitle>Team</StyledTitle>
            <AddPersonToCompany companyId={company.id} peopleIds={peopleIds} />
          </StyledTitleContainer>
          <StyledListContainer>
            {data?.people?.map((person, id) => (
              <PeopleCard
                key={person.id}
                person={person}
                hasBottomBorder={id !== data.people.length - 1}
              />
            ))}
          </StyledListContainer>
        </StyledContainer>
      )}
    </>
  );
};
