import styled from '@emotion/styled';
import { defineFrontComponent } from 'twenty-sdk/define';
import { useSelectedRecordIds } from 'twenty-sdk/front-component';
import { Callout, IconAlertCircle, themeCssVariables } from 'twenty-sdk/ui';

import { TRANSCRIPT_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/transcript-front-component-universal-identifier';
import { useCallRecordingTranscript } from 'src/front-components/hooks/use-call-recording-transcript';
import { type TranscriptEntry } from 'src/front-components/types/transcript-entry.type';
import { formatTranscriptTimestamp } from 'src/front-components/utils/format-transcript-timestamp.util';
import { parseTranscriptEntries } from 'src/front-components/utils/parse-transcript-entries.util';
import { parseRecallTranscriptMarker } from 'src/logic-functions/utils/parse-recall-transcript-marker.util';

// Theme values are interpolated lazily: the manifest build proxy-mocks twenty-sdk/ui, so module-scope nested access throws.
const StyledStateContainer = styled.div`
  box-sizing: border-box;
  font-family: ${() => themeCssVariables.font.family};
  height: 100%;
  padding: ${() => themeCssVariables.spacing[4]};
`;

const StyledCenteredState = styled(StyledStateContainer)`
  align-items: center;
  color: ${() => themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${() => themeCssVariables.font.size.sm};
  justify-content: center;
`;

const StyledTranscriptContainer = styled(StyledStateContainer)`
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[4]};
  overflow-y: auto;
`;

const StyledEntry = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[1]};
`;

const StyledEntryHeader = styled.div`
  align-items: baseline;
  display: flex;
  gap: ${() => themeCssVariables.spacing[2]};
`;

const StyledSpeakerName = styled.span`
  color: ${() => themeCssVariables.font.color.primary};
  font-size: ${() => themeCssVariables.font.size.sm};
  font-weight: ${() => themeCssVariables.font.weight.medium};
`;

const StyledTimestamp = styled.span`
  color: ${() => themeCssVariables.font.color.tertiary};
  font-size: ${() => themeCssVariables.font.size.xs};
`;

const StyledEntryText = styled.p`
  color: ${() => themeCssVariables.font.color.secondary};
  font-size: ${() => themeCssVariables.font.size.sm};
  line-height: 1.5;
  margin: 0;
`;

type TranscriptErrorCalloutProps = {
  title: string;
  description: string;
};

const TranscriptErrorCallout = ({
  title,
  description,
}: TranscriptErrorCalloutProps) => (
  <StyledStateContainer>
    <Callout
      variant="error"
      title={title}
      description={description}
      Icon={IconAlertCircle}
    />
  </StyledStateContainer>
);

type TranscriptEntryListProps = {
  entries: TranscriptEntry[];
};

const TranscriptEntryList = ({ entries }: TranscriptEntryListProps) => (
  <StyledTranscriptContainer>
    {entries.map((entry, entryIndex) => (
      <StyledEntry key={entryIndex}>
        <StyledEntryHeader>
          <StyledSpeakerName>{entry.speakerName}</StyledSpeakerName>
          {entry.startSeconds !== null && (
            <StyledTimestamp>
              {formatTranscriptTimestamp(entry.startSeconds)}
            </StyledTimestamp>
          )}
        </StyledEntryHeader>
        <StyledEntryText>{entry.text}</StyledEntryText>
      </StyledEntry>
    ))}
  </StyledTranscriptContainer>
);

const CallRecordingTranscript = () => {
  const selectedRecordIds = useSelectedRecordIds();
  const callRecordingId =
    selectedRecordIds.length === 1 ? selectedRecordIds[0] : null;

  const { transcript, loading, errorMessage } =
    useCallRecordingTranscript(callRecordingId);

  if (callRecordingId === null) {
    return (
      <StyledCenteredState>
        Open a call recording to see its transcript.
      </StyledCenteredState>
    );
  }

  if (loading) {
    return <StyledCenteredState>Loading transcript…</StyledCenteredState>;
  }

  if (errorMessage !== null) {
    return (
      <TranscriptErrorCallout
        title="Failed to load the transcript"
        description={errorMessage}
      />
    );
  }

  if (transcript === null || transcript === undefined) {
    return (
      <StyledCenteredState>
        No transcript for this recording yet.
      </StyledCenteredState>
    );
  }

  const marker = parseRecallTranscriptMarker(transcript);

  if (marker?.status === 'PENDING') {
    return (
      <StyledCenteredState>
        The transcript is being generated. Check back in a few minutes.
      </StyledCenteredState>
    );
  }

  if (marker?.status === 'FAILED') {
    return (
      <TranscriptErrorCallout
        title="Transcription failed"
        description={
          marker.subCode === null || marker.subCode === undefined
            ? 'The transcription provider could not process this recording.'
            : `The transcription provider could not process this recording (${marker.subCode}).`
        }
      />
    );
  }

  const entries = parseTranscriptEntries(transcript);

  if (entries === null) {
    return (
      <TranscriptErrorCallout
        title="Unrecognized transcript format"
        description="The stored transcript does not match the expected diarized format."
      />
    );
  }

  if (entries.length === 0) {
    return <StyledCenteredState>The transcript is empty.</StyledCenteredState>;
  }

  return <TranscriptEntryList entries={entries} />;
};

export default defineFrontComponent({
  universalIdentifier: TRANSCRIPT_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'call-recording-transcript',
  description:
    'Read-only diarized transcript viewer for the call recording record page.',
  component: CallRecordingTranscript,
});
