import styled from '@emotion/styled';

import { getDisplayNameFromParticipant } from '@/activities/emails/utils/getDisplayNameFromParticipant';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { RecordChip } from '@/object-record/components/RecordChip';
import { Avatar } from '@/users/components/Avatar';

const StyledAvatar = styled(Avatar)`
  margin: ${({ theme }) => theme.spacing(0, 1)};
`;

const StyledSenderName = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledContainer = styled.div`
  align-items: flex-start;
  display: flex;
`;

const StyledRecordChip = styled(RecordChip)`
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

export const ParticipantChip = ({ participant }: any) => {
  const { person, workspaceMember } = participant;

  const displayName = getDisplayNameFromParticipant({
    participant,
    shouldUseFullName: true,
  });

  const avatarUrl = person?.avatarUrl ?? workspaceMember?.avatarUrl ?? '';

  return (
    <StyledContainer>
      {person ? (
        <StyledRecordChip
          objectNameSingular={CoreObjectNameSingular.Person}
          record={person}
        />
      ) : (
        <>
          <StyledAvatar
            avatarUrl={avatarUrl}
            type="rounded"
            placeholder={displayName}
            size="sm"
          />
          <StyledSenderName>{displayName}</StyledSenderName>
        </>
      )}
    </StyledContainer>
  );
};
