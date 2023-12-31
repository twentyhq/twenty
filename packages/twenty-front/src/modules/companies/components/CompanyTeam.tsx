import { useQuery } from '@apollo/client';
import styled from '@emotion/styled';
import { isNonEmptyArray } from '@sniptt/guards';

import { Company } from '@/companies/types/Company';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { mapPaginatedRecordsToRecords } from '@/object-record/utils/mapPaginatedRecordsToRecords';
import { PeopleCard } from '@/people/components/PeopleCard';

import { AddPersonToCompany } from './AddPersonToCompany';

export type CompanyTeamProps = {
  company: Pick<Company, 'id'>;
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(6)};
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

export const CompanyTeam = ({ company }: { company: any }) => {
  const { findManyRecordsQuery } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.Person,
  });

  const { data } = useQuery(findManyRecordsQuery, {
    variables: {
      filter: {
        companyId: {
          eq: company.id,
        },
      },
    },
  });

  const people = mapPaginatedRecordsToRecords({
    objectNamePlural: 'people',
    pagedRecords: data ?? [],
  });

  const peopleIds = people.map((person) => person.id);

  const hasPeople = isNonEmptyArray(peopleIds);

  return (
    <>
      {hasPeople && (
        <StyledContainer>
          <StyledTitleContainer>
            <StyledTitle>Team</StyledTitle>
            <AddPersonToCompany companyId={company.id} peopleIds={peopleIds} />
          </StyledTitleContainer>
          <StyledListContainer>
            {people.map((person: any) => (
              <PeopleCard
                key={person.id}
                person={person}
                hasBottomBorder={person.id !== people.length - 1}
              />
            ))}
          </StyledListContainer>
        </StyledContainer>
      )}
    </>
  );
};
