import { CallRecordingTranscriptEntryListItem } from '@/page-layout/widgets/call-recording-transcript/components/CallRecordingTranscriptEntryListItem';
import { findActiveCallRecordingTranscriptEntryIndex } from '@/page-layout/widgets/call-recording-transcript/utils/findActiveCallRecordingTranscriptEntryIndex';
import { styled } from '@linaria/react';
import { type CallRecordingParsedTranscriptEntry } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledEntryList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[6]};
  list-style: none;
  margin: 0;
  padding: ${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[6]} 0;
`;

type CallRecordingTranscriptEntryListProps = {
  entries: CallRecordingParsedTranscriptEntry[];
  currentTimeSeconds?: number;
};

export const CallRecordingTranscriptEntryList = ({
  entries,
  currentTimeSeconds,
}: CallRecordingTranscriptEntryListProps) => {
  const activeEntryIndex = isDefined(currentTimeSeconds)
    ? findActiveCallRecordingTranscriptEntryIndex({
        entries,
        currentTimeSeconds,
      })
    : -1;

  return (
    <StyledEntryList>
      {entries.map((entry, entryIndex) => (
        <CallRecordingTranscriptEntryListItem
          key={entryIndex}
          entry={entry}
          isActive={entryIndex === activeEntryIndex}
          currentTimeSeconds={currentTimeSeconds}
        />
      ))}
    </StyledEntryList>
  );
};
