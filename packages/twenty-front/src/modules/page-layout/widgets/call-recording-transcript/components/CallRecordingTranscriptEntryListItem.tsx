import { formatCallRecordingTranscriptTimestamp } from '@/page-layout/widgets/call-recording-transcript/utils/formatCallRecordingTranscriptTimestamp';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { Avatar, Chip, ChipVariant } from 'twenty-ui/data-display';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { type CallRecordingParsedTranscriptEntry } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const StyledEntry = styled.li`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledEntryHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
`;

const StyledTimestamp = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  font-variant-numeric: tabular-nums;
`;

const StyledText = styled.p`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  line-height: ${themeCssVariables.text.lineHeight.lg};
  margin: 0;
  white-space: pre-wrap;
`;

type CallRecordingTranscriptEntryListItemProps = {
  entry: CallRecordingParsedTranscriptEntry;
};

export const CallRecordingTranscriptEntryListItem = ({
  entry,
}: CallRecordingTranscriptEntryListItemProps) => {
  const speakerName = entry.speakerName ?? t`Unknown speaker`;

  return (
    <StyledEntry>
      <StyledEntryHeader>
        <Chip
          clickable={false}
          label={speakerName}
          variant={ChipVariant.Transparent}
          leftComponent={
            <Avatar
              placeholder={speakerName}
              placeholderColorSeed={speakerName}
              size="sm"
              type="rounded"
            />
          }
        />
        {isDefined(entry.startSeconds) && (
          <StyledTimestamp>
            {formatCallRecordingTranscriptTimestamp(entry.startSeconds)}
          </StyledTimestamp>
        )}
      </StyledEntryHeader>
      <StyledText>{entry.text}</StyledText>
    </StyledEntry>
  );
};
