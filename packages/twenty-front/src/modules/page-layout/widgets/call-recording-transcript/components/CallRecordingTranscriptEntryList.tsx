import { CallRecordingTranscriptEntryListItem } from '@/page-layout/widgets/call-recording-transcript/components/CallRecordingTranscriptEntryListItem';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { type CallRecordingParsedTranscriptEntry } from 'twenty-shared/types';

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

export const CallRecordingTranscriptEntryList = ({
  entries,
}: CallRecordingTranscriptEntryListProps) => (
  <StyledEntryList>
    {entries.map((entry, entryIndex) => (
      <CallRecordingTranscriptEntryListItem key={entryIndex} entry={entry} />
    ))}
  </StyledEntryList>
);
