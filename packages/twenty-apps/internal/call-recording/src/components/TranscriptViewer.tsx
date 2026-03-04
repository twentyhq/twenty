import styled from '@emotion/styled';

import {
  type TranscriptEntry,
  type TranscriptWord,
} from 'src/hooks/useTranscript';
import { isDefined } from 'twenty-shared/utils';

type TranscriptViewerProps = {
  entries: TranscriptEntry[];
  currentTimeSeconds: number;
};

const StyledTranscriptCard = styled.div`
  background: #ffffff;
  border-radius: 8px;
  overflow: hidden;
`;

const StyledTranscriptContent = styled.div`
  max-height: 500px;
  overflow-y: auto;
`;

const StyledEntry = styled.div<{ isActive: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  background-color: ${({ isActive }) =>
    isActive ? '#f1f1f1' : 'transparent'};

  & + & {
    margin-top: 2px;
  }
`;

const StyledSpeaker = styled.span`
  font-weight: 600;
  color: #333333;
  font-size: 0.92rem;
`;

const StyledTextContent = styled.div`
  line-height: 1.5;
`;

const StyledWord = styled.span<{ isSpoken: boolean }>`
  font-size: 0.92rem;
  line-height: 1.5;
  transition: color 0.15s ease;
  color: ${({ isSpoken }) => (isSpoken ? '#333333' : '#b3b3b3')};
`;

const getEntryTimeRange = (entry: TranscriptEntry) => {
  const firstWord = entry.words[0];
  const lastWord = entry.words[entry.words.length - 1];

  const start = firstWord?.start_timestamp?.relative;
  const end = lastWord?.end_timestamp?.relative;

  return { start, end };
};

const findActiveEntryIndex = (
  entries: TranscriptEntry[],
  currentTimeSeconds: number,
): number => {
  for (let index = entries.length - 1; index >= 0; index--) {
    const { start, end } = getEntryTimeRange(entries[index]);

    if (!isDefined(start) || !isDefined(end)) {
      continue;
    }

    if (currentTimeSeconds >= start && currentTimeSeconds <= end) {
      return index;
    }
  }

  return -1;
};

const isWordSpoken = (
  word: TranscriptWord,
  currentTimeSeconds: number,
): boolean => {
  const start = word.start_timestamp?.relative;

  if (!isDefined(start)) {
    return false;
  }

  return currentTimeSeconds >= start;
};

export const TranscriptViewer = ({
  entries,
  currentTimeSeconds,
}: TranscriptViewerProps) => {
  if (entries.length === 0) {
    return;
  }

  const activeEntryIndex = findActiveEntryIndex(entries, currentTimeSeconds);

  return (
    <StyledTranscriptCard>
      <StyledTranscriptContent>
        {entries.map((entry, index) => {
          const speaker = entry.participant?.name ?? 'Unknown';
          const isActive = index === activeEntryIndex;

          return (
            <StyledEntry key={index} isActive={isActive}>
              <StyledSpeaker>{speaker}</StyledSpeaker>
              <StyledTextContent>
                {entry.words.map((word, wordIndex) => (
                  <StyledWord
                    key={wordIndex}
                    isSpoken={isWordSpoken(word, currentTimeSeconds)}
                  >
                    {wordIndex > 0 ? ' ' : ''}
                    {word.text}
                  </StyledWord>
                ))}
              </StyledTextContent>
            </StyledEntry>
          );
        })}
      </StyledTranscriptContent>
    </StyledTranscriptCard>
  );
};
