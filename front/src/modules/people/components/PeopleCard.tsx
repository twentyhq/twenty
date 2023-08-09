import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';

import { Avatar } from '@/users/components/Avatar';
import { Person } from '~/generated/graphql';

export type PeopleCardPropsType = {
  person: Pick<Person, 'id' | 'avatarUrl' | 'displayName' | 'jobTitle'>;
};

const StyledCard = styled.div`
  align-items: center;
  align-self: stretch;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  height: ${({ theme }) => theme.spacing(8)};
  padding: ${({ theme }) => theme.spacing(3)};

  &:hover {
    background: ${({ theme }) => theme.background.tertiary};
    cursor: pointer;
  }
`;

const StyledCardInfo = styled.div`
  align-items: flex-start;
  display: flex;
  flex: 1 0 0;
  flex-direction: column;
`;

const StyledTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  line-height: ${({ theme }) => theme.text.lineHeight.lg};
`;

const StyledJobTitle = styled.div`
  border-radius: ${({ theme }) => theme.spacing(1)};
  color: ${({ theme }) => theme.font.color.secondary};
  padding-bottom: ${({ theme }) => theme.spacing(0.5)};
  padding-left: ${({ theme }) => theme.spacing(0)};
  padding-right: ${({ theme }) => theme.spacing(2)};
  padding-top: ${({ theme }) => theme.spacing(0.5)};

  &:hover {
    background: ${({ theme }) => theme.background.tertiary};
  }
`;

export function PeopleCard({ person }: PeopleCardPropsType) {
  const navigate = useNavigate();
  return (
    <StyledCard onClick={() => navigate(`/person/${person.id}`)}>
      <Avatar
        size="lg"
        type="rounded"
        placeholder={person.displayName}
        avatarUrl={person.avatarUrl}
      />
      <StyledCardInfo>
        <StyledTitle>{person.displayName}</StyledTitle>
        <StyledJobTitle> {person.jobTitle ?? 'Add job title'}</StyledJobTitle>
      </StyledCardInfo>
    </StyledCard>
  );
}
