import styled from '@emotion/styled';
import { AppPath, navigate } from 'twenty-sdk/front-component';
import { Avatar, Chip, ChipVariant } from 'twenty-ui/data-display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { type CallParticipantDisplayItem } from 'src/front-components/types/call-participant-display-item.type';

const StyledChipButton = styled.button`
  background: none;
  border: none;
  border-radius: ${() => themeCssVariables.border.radius.sm};
  cursor: pointer;
  display: inline-flex;
  font: inherit;
  max-width: 100%;
  padding: 0;

  &:focus-visible {
    outline: 1px solid ${() => themeCssVariables.border.color.blue};
  }
`;

type CallParticipantChipProps = {
  participant: CallParticipantDisplayItem;
};

export const CallParticipantChip = ({
  participant,
}: CallParticipantChipProps) => {
  switch (participant.kind) {
    case 'person': {
      const handleClick = () => {
        void navigate(AppPath.RecordShowPage, {
          objectNameSingular: 'person',
          objectRecordId: participant.personId,
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
