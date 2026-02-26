import styled from '@emotion/styled';

import { TranscriptEntry } from 'src/hooks/useTranscript';
import { isDefined } from 'twenty-shared/utils';

type TranscriptViewerProps = {
  entries: TranscriptEntry[];
  currentTimeSeconds: number;
};

const StyledTranscriptContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
`;

const StyledEntryRow = styled.div<{ isActive: boolean }>`
  line-height: 1.5;
  padding: 4px 8px;
  border-radius: 4px;
  background-color: ${({ isActive }) =>
    isActive ? 'rgba(25, 97, 237, 0.08)' : 'transparent'};
  transition: background-color 0.2s ease;
`;

const StyledSpeakerName = styled.span`
  font-weight: 600;
`;

const StyledWord = styled.span<{ isActive: boolean }>`
  background-color: ${({ isActive }) =>
    isActive ? 'rgba(25, 97, 237, 0.25)' : 'transparent'};
  border-radius: ${({ isActive }) => (isActive ? '2px' : '0')};
  transition: background-color 0.15s ease;
`;

const isEntryActive = (
  entry: TranscriptEntry,
  currentTimeSeconds: number,
): boolean => {
  const firstWordStart = entry.words[0]?.start_timestamp?.relative;
  const lastWordEnd =
    entry.words[entry.words.length - 1]?.end_timestamp?.relative;

  if (isDefined(firstWordStart) && isDefined(lastWordEnd)) {
    return (
      currentTimeSeconds >= firstWordStart &&
      currentTimeSeconds <= lastWordEnd
    );
  }

  return false;
};

export const TranscriptViewer = ({
  entries,
  currentTimeSeconds,
}: TranscriptViewerProps) => {
  const activeEntryIndex = entries.findIndex((entry) =>
    isEntryActive(entry, currentTimeSeconds),
  );

  if (entries.length === 0) {
    return;
  }

  return (
    <StyledTranscriptContainer>
      {entries.map((entry, entryIndex) => {
        const speaker = entry.participant?.name ?? 'Unknown';
        const entryIsActive = entryIndex === activeEntryIndex;

        return (
          <StyledEntryRow key={entryIndex} isActive={entryIsActive}>
            <StyledSpeakerName>{speaker}:</StyledSpeakerName>{' '}
            {entry.words.map((word, wordIndex) => {
              const startSeconds = word.start_timestamp?.relative;
              const endSeconds = word.end_timestamp?.relative;

              const wordIsActive =
                isDefined(startSeconds) &&
                isDefined(endSeconds) &&
                currentTimeSeconds >= startSeconds &&
                currentTimeSeconds <= endSeconds;

              return (
                <StyledWord
                  key={wordIndex}
                  isActive={wordIsActive}
                >
                  {word.text}{' '}
                </StyledWord>
              );
            })}
          </StyledEntryRow>
        );
      })}
    </StyledTranscriptContainer>
  );
};
