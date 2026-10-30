import { Avatar, Chip } from 'twenty-ui/primitives/data-display';

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
            clickable
            variant="soft"
            startElement={
              <Avatar
                src={participant.avatarUrl}
                name={participant.label}
                colorSeed={participant.personId}
                shape="circle"
                size="sm"
              />
            }
          >
            {participant.label}
          </Chip>
        </StyledChipButton>
      );
    }
    case 'workspaceMember':
      return (
        <Chip
          clickable={false}
          variant="plain"
          startElement={
            <Avatar
              src={participant.avatarUrl}
              name={participant.label}
              colorSeed={participant.workspaceMemberId}
              shape="circle"
              size="sm"
            />
          }
        >
          {participant.label}
        </Chip>
      );
    case 'unmatched':
      return (
        <Chip clickable={false} variant="plain">
          {participant.label}
        </Chip>
      );
  }
};
