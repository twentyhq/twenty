import styled from '@emotion/styled';

import { PeopleCard } from '@/people/components/PeopleCard';
import { Company, useGetPeopleQuery } from '~/generated/graphql';

export type CompanyTeamPropsType = {
  company: Pick<Company, 'id'>;
};

const StyledContainer = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledTitleContainer = styled.div`
  align-items: center;
  backdrop-filter: blur(5px);
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  justify-content: space-between;
  padding: 12px 12px 0px 12px;
  padding-bottom: ${({ theme }) => theme.spacing(0)};
  padding-left: ${({ theme }) => theme.spacing(3)};
  padding-right: ${({ theme }) => theme.spacing(3)};
  padding-top: ${({ theme }) => theme.spacing(3)};
`;

const StyledListContainer = styled.div`
  align-items: flex-start;
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.spacing(1)};
  display: flex;
  flex-direction: column;
  max-height: ${({ theme }) => theme.spacing(35)};
  overflow: auto;
  width: 100%;
`;

const StyledTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  line-height: ${({ theme }) => theme.text.lineHeight.lg};
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
    <>
      {Boolean(data?.people?.length) && (
        <StyledContainer>
          <StyledTitleContainer>
            <StyledTitle>Team</StyledTitle>
          </StyledTitleContainer>
          <StyledListContainer>
            {data?.people?.map((person) => (
              <PeopleCard key={person.id} person={person} />
            ))}
          </StyledListContainer>
        </StyledContainer>
      )}
    </>
  );
}
