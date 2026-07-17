import styled from '@emotion/styled';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { TranscriptEntryListItem } from 'src/front-components/components/TranscriptEntryListItem';
import { type TranscriptEntry } from 'src/front-components/types/transcript-entry.type';

const StyledTranscriptContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[2]};
  min-height: 0;
`;

type TranscriptEntryListProps = {
  entries: TranscriptEntry[];
};

export const TranscriptEntryList = ({ entries }: TranscriptEntryListProps) => (
  <StyledTranscriptContainer>
    {entries.map((entry, entryIndex) => (
      <TranscriptEntryListItem key={entryIndex} entry={entry} />
    ))}
  </StyledTranscriptContainer>
);
