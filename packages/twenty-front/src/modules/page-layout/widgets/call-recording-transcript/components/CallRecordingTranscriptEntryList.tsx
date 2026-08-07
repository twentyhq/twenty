import { CallRecordingTranscriptEntryListItem } from '@/page-layout/widgets/call-recording-transcript/components/CallRecordingTranscriptEntryListItem';
import { styled } from '@linaria/react';
import { type CallRecordingParsedTranscriptEntry } from 'twenty-shared/types';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledEntryList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[6]};
  list-style: none;
  margin: 0;
  padding: ${themeCssVariables.spacing[6]};
`;

type CallRecordingTranscriptEntryListProps = {
  entries: CallRecordingParsedTranscriptEntry[];
};

// Two entries only ever share timing, speaker and text when the provider sent
// duplicate data, so the content itself is a stable key.
const getEntryKey = (entry: CallRecordingParsedTranscriptEntry): string =>
  `${entry.startSeconds ?? 'no-start'}-${entry.endSeconds ?? 'no-end'}-${entry.speakerName ?? 'no-speaker'}-${entry.text}`;

export const CallRecordingTranscriptEntryList = ({
  entries,
}: CallRecordingTranscriptEntryListProps) => (
  <StyledEntryList>
    {entries.map((entry) => (
      <CallRecordingTranscriptEntryListItem
        key={getEntryKey(entry)}
        entry={entry}
      />
    ))}
  </StyledEntryList>
);
