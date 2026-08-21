import { CallRecordingTranscriptEntryListItem } from '@/page-layout/widgets/call-recording-transcript/components/CallRecordingTranscriptEntryListItem';
import { CallRecordingTranscriptFollowScrollEffect } from '@/page-layout/widgets/call-recording-transcript/components/CallRecordingTranscriptFollowScrollEffect';
import { type CallRecordingTranscriptEntryPlaybackPhase } from '@/page-layout/widgets/call-recording-transcript/types/CallRecordingTranscriptEntryPlaybackPhase';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import {
  useCallback,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';
import { type CallRecordingParsedTranscriptEntry } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledTranscriptContainer = styled.div`
  height: 100%;
  min-height: 0;
  position: relative;
`;

const StyledTranscriptScrollContainer = styled.div`
  height: 100%;
  min-height: 0;
  overflow-y: auto;
`;

const StyledEntryList = styled.ul<{ hasPlaybackControls: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[6]};
  list-style: none;
  margin: 0;
  padding: ${({ hasPlaybackControls }) =>
    hasPlaybackControls
      ? `${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[6]} ${themeCssVariables.spacing[10]}`
      : themeCssVariables.spacing[6]};
`;

const StyledResumeFollowButton = styled.div`
  bottom: ${themeCssVariables.spacing[3]};
  left: 50%;
  position: absolute;
  transform: translateX(-50%);
`;

type CallRecordingTranscriptEntryListProps = {
  entries: CallRecordingParsedTranscriptEntry[];
  activeEntryIndex?: number;
  lastStartedEntryIndex?: number;
  videoElement?: HTMLVideoElement | null;
  onEntrySelect?: (entryStartSeconds: number) => void;
};

export const CallRecordingTranscriptEntryList = ({
  entries,
  activeEntryIndex,
  lastStartedEntryIndex,
  videoElement,
  onEntrySelect,
}: CallRecordingTranscriptEntryListProps) => {
  const scrollContainerElementRef = useRef<HTMLDivElement>(null);
  const activeEntryElementRef = useRef<HTMLLIElement>(null);
  const [isFollowingPlayback, setIsFollowingPlayback] = useState(true);

  const setActiveEntryElement = useCallback(
    (activeEntryElement: HTMLLIElement | null) => {
      activeEntryElementRef.current = activeEntryElement;
    },
    [],
  );

  const stopFollowingPlayback = useCallback(() => {
    setIsFollowingPlayback(false);
  }, []);

  const selectTranscriptEntry = useCallback(
    (entryStartSeconds: number) => {
      setIsFollowingPlayback(true);
      onEntrySelect?.(entryStartSeconds);
    },
    [onEntrySelect],
  );

  const handleScrollContainerPointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget) {
        stopFollowingPlayback();
      }
    },
    [stopFollowingPlayback],
  );

  const handleScrollContainerKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (
        [
          'ArrowDown',
          'ArrowUp',
          'End',
          'Home',
          'PageDown',
          'PageUp',
          ' ',
        ].includes(event.key)
      ) {
        stopFollowingPlayback();
      }
    },
    [stopFollowingPlayback],
  );

  const hasPlayback = isDefined(lastStartedEntryIndex);

  const entryList = (
    <StyledEntryList hasPlaybackControls={hasPlayback}>
      {entries.map((entry, entryIndex) => {
        const playbackPhase = getEntryPlaybackPhase({
          activeEntryIndex,
          entryIndex,
          lastStartedEntryIndex,
        });
        const isActive = playbackPhase === 'speaking';

        return (
          <CallRecordingTranscriptEntryListItem
            key={entryIndex}
            entry={entry}
            entryElementRef={isActive ? setActiveEntryElement : undefined}
            playbackPhase={playbackPhase}
            videoElement={videoElement}
            onSelect={onEntrySelect ? selectTranscriptEntry : undefined}
          />
        );
      })}
    </StyledEntryList>
  );

  return (
    <StyledTranscriptContainer>
      <CallRecordingTranscriptFollowScrollEffect
        activeEntryElementRef={activeEntryElementRef}
        isFollowingPlayback={isFollowingPlayback}
        scrollContainerElementRef={scrollContainerElementRef}
        videoElement={videoElement}
      />
      <StyledTranscriptScrollContainer
        ref={scrollContainerElementRef}
        aria-label={t`Transcript`}
        role="region"
        tabIndex={0}
        onKeyDown={handleScrollContainerKeyDown}
        onPointerDown={handleScrollContainerPointerDown}
        onTouchMove={stopFollowingPlayback}
        onWheel={stopFollowingPlayback}
      >
        {entryList}
      </StyledTranscriptScrollContainer>
      {hasPlayback && !isFollowingPlayback && (
        <StyledResumeFollowButton>
          <Button
            ariaLabel={t`Jump to current`}
            size="small"
            title={t`Jump to current`}
            variant="secondary"
            onClick={() => setIsFollowingPlayback(true)}
          />
        </StyledResumeFollowButton>
      )}
    </StyledTranscriptContainer>
  );
};

const getEntryPlaybackPhase = ({
  activeEntryIndex,
  entryIndex,
  lastStartedEntryIndex,
}: {
  activeEntryIndex: number | undefined;
  entryIndex: number;
  lastStartedEntryIndex: number | undefined;
}): CallRecordingTranscriptEntryPlaybackPhase | undefined => {
  if (!isDefined(lastStartedEntryIndex) || lastStartedEntryIndex === -1) {
    return undefined;
  }

  if (entryIndex === activeEntryIndex) {
    return 'speaking';
  }

  if (entryIndex <= lastStartedEntryIndex) {
    return 'spoken';
  }

  return 'upcoming';
};
