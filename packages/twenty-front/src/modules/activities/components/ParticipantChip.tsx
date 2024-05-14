import styled from '@emotion/styled';
import { Avatar } from 'twenty-ui';

import { getDisplayNameFromParticipant } from '@/activities/emails/utils/getDisplayNameFromParticipant';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { RecordChip } from '@/object-record/components/RecordChip';
import { getImageAbsoluteURIOrBase64 } from '~/utils/image/getImageAbsoluteURIOrBase64';
import { gql, useQuery } from '@apollo/client';
import React from 'react';
import { UUID } from 'crypto';

var queryPerson = gql`
query FindOnePerson($objectRecordId: UUID!) {
  person(filter: { id: { eq: $objectRecordId } }) {
    __typename
    avatarUrl
  }
}
`;
var queryWorkspaceMember = gql`
query FindOneWorkspaceMember($objectRecordId: UUID!) {
  workspaceMember(filter: { id: { eq: $objectRecordId } }) {
    __typename
    avatarUrl
  }
}
`;

const StyledAvatar = styled(Avatar)`
  margin-right: ${({ theme }) => theme.spacing(1)};
`;

const StyledSenderName = styled.span<{ variant?: 'default' | 'bold' }>`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme, variant }) =>
    variant === 'bold' ? theme.font.weight.medium : theme.font.weight.regular};
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledContainer = styled.div`
  align-items: flex-start;
  display: flex;
`;

const StyledRecordChip = styled(RecordChip)<{
  participantChipVariant: 'default' | 'bold';
}>`
  font-weight: ${({ theme, participantChipVariant }) =>
    participantChipVariant === 'bold'
      ? theme.font.weight.medium
      : theme.font.weight.regular};
`;

const StyledChip = styled.div`
  align-items: center;
  display: flex;
  padding: ${({ theme }) => theme.spacing(1)};
  height: 20px;
  box-sizing: border-box;
  white-space: nowrap;
`;

type ParticipantChipVariant = 'default' | 'bold';

export const ParticipantChip = ({
  participant,
  variant = 'default',
  className,
}: {
  participant: any;
  variant?: ParticipantChipVariant;
  className?: string;
}) => {
  const [personId, setPersonId] = React.useState<string>('');
  const [workspaceMemberId, setWorkspaceMemberId] = React.useState<string>('');

  // Trigger the queries when personId or workspaceMemberId changes
  React.useEffect(() => {
    setPersonId(participant.personId || '');
    setWorkspaceMemberId(participant.workspaceMemberId || '');
  }, [participant.personId, participant.workspaceMemberId]);

  const personData = useQuery(queryPerson, {
    variables: { objectRecordId: personId as UUID },
    skip: !personId, 
  });

  const workspaceMemberData = useQuery(queryWorkspaceMember, {
    variables: { objectRecordId: workspaceMemberId as UUID},
    skip: !workspaceMemberId,
  });

  const dataPerson = personData.data;
  const dataWorkspaceMember = workspaceMemberData.data;

  const { person, workspaceMember } = participant;

  const displayName = getDisplayNameFromParticipant({
    participant,
    shouldUseFullName: true,
  });

  const avatarUrl =
    dataPerson?.person?.avatarUrl ?? dataWorkspaceMember?.workspaceMember?.avatarUrl ?? '';

  return (
    <StyledContainer className={className}>
      {person ? (
        <StyledRecordChip
          objectNameSingular={CoreObjectNameSingular.Person}
          record={person}
          participantChipVariant={variant}
        />
      ) : (
        <StyledChip>
          <StyledAvatar
            avatarUrl={getImageAbsoluteURIOrBase64(avatarUrl)}
            type="rounded"
            placeholder={displayName}
            size="sm"
          />
          <StyledSenderName variant={variant}>{displayName}</StyledSenderName>
        </StyledChip>
      )}
    </StyledContainer>
  );
};