import styled from '@emotion/styled';

import { getDisplayNameFromParticipant } from '@/activities/emails/utils/getDisplayNameFromParticipant';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { RecordChip } from '@/object-record/components/RecordChip';
import { Avatar } from '@/users/components/Avatar';

const StyledAvatar = styled(Avatar)`
  margin: ${({ theme }) => theme.spacing(0, 1)};
`;

const StyledSenderName = styled.span<{ variant?: 'default' | 'bold' }>`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme, variant }) =>
    variant === 'bold' ? theme.font.weight.medium : theme.font.weight.regular};
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledContainer = styled.div`
  align-items: flex-start;
  display: flex;
`;

const StyledRecordChip = styled(RecordChip)<{ variant: 'default' | 'bold' }>`
  font-weight: ${({ theme, variant }) =>
    variant === 'bold' ? theme.font.weight.medium : theme.font.weight.regular};
`;

export const ParticipantChip = ({
  participant,
  variant = 'default',
}: {
  participant: any;
  variant?: 'default' | 'bold';
}) => {
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
          variant={variant}
        />
      ) : (
        <>
          <StyledAvatar
            avatarUrl={avatarUrl}
            type="rounded"
            placeholder={displayName}
            size="sm"
          />
          <StyledSenderName variant={variant}>{displayName}</StyledSenderName>
        </>
      )}
    </StyledContainer>
  );
};
