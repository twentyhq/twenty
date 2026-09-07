import { CallRecordingTranscriptEntryWords } from '@/page-layout/widgets/call-recording-transcript/components/CallRecordingTranscriptEntryWords';
import { type CallRecordingTranscriptEntryPlaybackPhase } from '@/page-layout/widgets/call-recording-transcript/types/CallRecordingTranscriptEntryPlaybackPhase';
import { formatCallRecordingTranscriptTimestamp } from '@/page-layout/widgets/call-recording-transcript/utils/formatCallRecordingTranscriptTimestamp';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { type Ref } from 'react';
import { type CallRecordingParsedTranscriptEntry } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { Avatar, Chip, ChipVariant } from 'twenty-ui/data-display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledEntry = styled.li<{
  hasPlaybackControls: boolean;
  isActive: boolean;
  isSelectable: boolean;
}>`
  background: ${({ isActive }) =>
    isActive ? themeCssVariables.background.transparent.blue : 'transparent'};
  border-radius: ${themeCssVariables.border.radius.sm};
  cursor: ${({ isSelectable }) => (isSelectable ? 'pointer' : 'default')};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${({ hasPlaybackControls }) =>
    hasPlaybackControls ? themeCssVariables.spacing[2] : 0};

  &:hover {
    background: ${({ isActive, isSelectable }) =>
      isActive
        ? themeCssVariables.background.transparent.blue
        : isSelectable
          ? themeCssVariables.background.transparent.lighter
          : 'transparent'};
  }
`;

const StyledEntryHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
`;

const StyledTimestamp = styled.span`
  background: transparent;
  border: 0;
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.tertiary};
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.xs};
  font-variant-numeric: tabular-nums;
  padding: 0;

  &:is(button) {
    cursor: pointer;
  }

  &:focus-visible {
    outline: 2px solid ${themeCssVariables.border.color.blue};
    outline-offset: 2px;
  }
`;

const StyledText = styled.p<{ isUpcoming: boolean }>`
  color: ${({ isUpcoming }) =>
    isUpcoming
      ? themeCssVariables.font.color.secondary
      : themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  line-height: ${themeCssVariables.text.lineHeight.lg};
  margin: 0;
  overflow-wrap: break-word;
  transition: color calc(${themeCssVariables.animation.duration.fast} * 1s) ease;
  white-space: pre-wrap;
`;

type CallRecordingTranscriptEntryListItemProps = {
  entry: CallRecordingParsedTranscriptEntry;
  playbackPhase?: CallRecordingTranscriptEntryPlaybackPhase;
  videoElement?: HTMLVideoElement;
  entryElementRef?: Ref<HTMLLIElement>;
  onSelect?: (entryStartSeconds: number) => void;
};

export const CallRecordingTranscriptEntryListItem = ({
  entry,
  playbackPhase,
  videoElement,
  entryElementRef,
  onSelect,
}: CallRecordingTranscriptEntryListItemProps) => {
  const speakerName = entry.speakerName ?? t`Unknown speaker`;
  const entryStartSeconds = entry.startSeconds;
  const isSelectable = isDefined(entryStartSeconds) && isDefined(onSelect);
  const isActive = playbackPhase === 'speaking';
  const hasPlaybackControls = isDefined(playbackPhase) || isDefined(onSelect);
  const hasSpokenWordHighlight =
    isActive && isDefined(videoElement) && isNonEmptyArray(entry.words);
  const formattedStartTimestamp = isDefined(entryStartSeconds)
    ? formatCallRecordingTranscriptTimestamp(entryStartSeconds)
    : undefined;

  const handleEntryClick = () => {
    if (!isDefined(entryStartSeconds) || !isDefined(onSelect)) {
      return;
    }

    // A click that ends a text selection must not seek away from it.
    const selection = window.getSelection();
    if (isDefined(selection) && !selection.isCollapsed) {
      return;
    }

    onSelect(entryStartSeconds);
  };

  return (
    <StyledEntry
      ref={entryElementRef}
      aria-current={isActive ? 'true' : undefined}
      hasPlaybackControls={hasPlaybackControls}
      isActive={isActive}
      isSelectable={isSelectable}
      onClick={isSelectable ? handleEntryClick : undefined}
    >
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
        {isDefined(formattedStartTimestamp) && (
          <StyledTimestamp
            as={isSelectable ? 'button' : undefined}
            aria-label={
              isSelectable
                ? t`Seek recording to ${formattedStartTimestamp}`
                : undefined
            }
          >
            {formattedStartTimestamp}
          </StyledTimestamp>
        )}
      </StyledEntryHeader>
      <StyledText isUpcoming={playbackPhase === 'upcoming'}>
        {hasSpokenWordHighlight ? (
          <CallRecordingTranscriptEntryWords
            words={entry.words}
            videoElement={videoElement}
          />
        ) : (
          entry.text
        )}
      </StyledText>
    </StyledEntry>
  );
};
