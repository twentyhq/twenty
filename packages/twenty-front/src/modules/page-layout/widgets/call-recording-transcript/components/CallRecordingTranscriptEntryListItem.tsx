import { formatCallRecordingTranscriptTimestamp } from '@/page-layout/widgets/call-recording-transcript/utils/formatCallRecordingTranscriptTimestamp';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import {
  type CallRecordingParsedTranscriptEntry,
  type CallRecordingParsedTranscriptWord,
} from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { Avatar, Chip, ChipVariant } from 'twenty-ui/data-display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledEntry = styled.li<{ isActive: boolean }>`
  background: ${({ isActive }) =>
    isActive ? themeCssVariables.background.transparent.blue : 'transparent'};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]};
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
  overflow-wrap: break-word;
  white-space: pre-wrap;
`;

const StyledWord = styled.span<{ isHighlighted: boolean }>`
  color: ${({ isHighlighted }) =>
    isHighlighted
      ? themeCssVariables.font.color.primary
      : themeCssVariables.font.color.secondary};
  transition: color calc(${themeCssVariables.animation.duration.fast} * 1s) ease;
`;

type CallRecordingTranscriptEntryListItemProps = {
  entry: CallRecordingParsedTranscriptEntry;
  isActive?: boolean;
  currentTimeSeconds?: number;
};

export const CallRecordingTranscriptEntryListItem = ({
  entry,
  isActive = false,
  currentTimeSeconds,
}: CallRecordingTranscriptEntryListItemProps) => {
  const speakerName = entry.speakerName ?? t`Unknown speaker`;

  return (
    <StyledEntry isActive={isActive}>
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
      <StyledText>
        {isNonEmptyArray(entry.words)
          ? entry.words.map((word, wordIndex) => (
              <StyledWord
                key={wordIndex}
                isHighlighted={isWordHighlighted({ word, currentTimeSeconds })}
              >
                {wordIndex > 0 ? ' ' : ''}
                {word.text}
              </StyledWord>
            ))
          : entry.text}
      </StyledText>
    </StyledEntry>
  );
};

const isWordHighlighted = ({
  word,
  currentTimeSeconds,
}: {
  word: CallRecordingParsedTranscriptWord;
  currentTimeSeconds: number | undefined;
}): boolean =>
  !isDefined(currentTimeSeconds) ||
  (isDefined(word.startSeconds) && currentTimeSeconds >= word.startSeconds);
