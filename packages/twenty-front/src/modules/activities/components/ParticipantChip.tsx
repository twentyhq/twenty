import styled from '@emotion/styled';

import { getDisplayNameFromParticipant } from '@/activities/emails/utils/getDisplayNameFromParticipant';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { RecordChip } from '@/object-record/components/RecordChip';
import { Avatar } from 'twenty-ui/display';

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
  gap: ${({ theme }) => theme.spacing(1)};
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
  const { person, workspaceMember } = participant;

  const displayName = getDisplayNameFromParticipant({
    participant,
    shouldUseFullName: true,
  });

  const avatarUrl = person?.avatarUrl ?? workspaceMember?.avatarUrl ?? '';

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
            avatarUrl={avatarUrl}
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
