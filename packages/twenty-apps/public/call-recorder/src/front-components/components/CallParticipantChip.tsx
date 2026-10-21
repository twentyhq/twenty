import { Avatar, Chip, ChipVariant } from 'twenty-ui/data-display';

import { StyledChipButton } from 'src/front-components/components/StyledChipButton';
import { type CallParticipantDisplayItem } from 'src/front-components/types/call-participant-display-item.type';
import { openRecord } from 'src/front-components/utils/open-record.util';

type CallParticipantChipProps = {
  participant: CallParticipantDisplayItem;
};

export const CallParticipantChip = ({
  participant,
}: CallParticipantChipProps) => {
  switch (participant.kind) {
    case 'person': {
      const handleClick = () => {
        void openRecord({
          objectNameSingular: 'person',
          recordId: participant.personId,
        });
      };

      return (
        <StyledChipButton type="button" onClick={handleClick}>
          <Chip
            label={participant.label}
            clickable
            variant={ChipVariant.Highlighted}
            leftComponent={
              <Avatar
                avatarUrl={participant.avatarUrl}
                placeholder={participant.label}
                placeholderColorSeed={participant.personId}
                type="rounded"
                size="sm"
              />
            }
          />
        </StyledChipButton>
      );
    }
    case 'workspaceMember':
      return (
        <Chip
          label={participant.label}
          clickable={false}
          variant={ChipVariant.Transparent}
          leftComponent={
            <Avatar
              avatarUrl={participant.avatarUrl}
              placeholder={participant.label}
              placeholderColorSeed={participant.workspaceMemberId}
              type="rounded"
              size="sm"
            />
          }
        />
      );
    case 'unmatched':
      return (
        <Chip
          label={participant.label}
          clickable={false}
          variant={ChipVariant.Transparent}
        />
      );
  }
};
