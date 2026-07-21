import styled from '@emotion/styled';
import { isUndefined } from '@sniptt/guards';
import { Avatar, Chip, ChipVariant } from 'twenty-ui/data-display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { type TranscriptEntry } from 'src/front-components/types/transcript-entry.type';
import { formatSecondsAsClockTimestamp } from 'src/front-components/utils/format-seconds-as-clock-timestamp.util';

const StyledEntry = styled.div`
  align-items: flex-start;
  border-radius: ${() => themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[2]};
  justify-content: center;
  padding: ${() => themeCssVariables.spacing[2]};
  width: 100%;
`;

const StyledEntryHeader = styled.div`
  align-items: center;
  align-self: stretch;
  display: flex;
  gap: ${() => themeCssVariables.spacing[2]};
  min-height: ${() => themeCssVariables.spacing[6]};
  min-width: 0;
`;

const StyledTimestamp = styled.span`
  color: ${() => themeCssVariables.font.color.tertiary};
  font-size: ${() => themeCssVariables.font.size.xs};
  line-height: 1.4;
`;

const StyledEntryText = styled.p`
  align-self: stretch;
  color: ${() => themeCssVariables.font.color.secondary};
  font-size: ${() => themeCssVariables.font.size.sm};
  line-height: 1.4;
  margin: 0;
`;

type TranscriptEntryListItemProps = {
  entry: TranscriptEntry;
};

export const TranscriptEntryListItem = ({
  entry,
}: TranscriptEntryListItemProps) => (
  <StyledEntry>
    <StyledEntryHeader>
      <Chip
        clickable={false}
        isBold
        label={entry.speakerName}
        variant={ChipVariant.Transparent}
        leftComponent={
          <Avatar
            avatarUrl={undefined}
            placeholder={entry.speakerName}
            placeholderColorSeed={entry.speakerName}
            size="md"
            type="rounded"
          />
        }
      />
      {!isUndefined(entry.startSeconds) && (
        <StyledTimestamp>
          {formatSecondsAsClockTimestamp(entry.startSeconds)}
        </StyledTimestamp>
      )}
    </StyledEntryHeader>
    <StyledEntryText>{entry.text}</StyledEntryText>
  </StyledEntry>
);
