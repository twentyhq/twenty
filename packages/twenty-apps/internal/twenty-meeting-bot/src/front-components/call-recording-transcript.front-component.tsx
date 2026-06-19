import styled from '@emotion/styled';
import { isUndefined } from '@sniptt/guards';
import { defineFrontComponent } from 'twenty-sdk/define';
import { useSelectedRecordIds } from 'twenty-sdk/front-component';

import { TRANSCRIPT_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/transcript-front-component-universal-identifier';
import { useCallRecordingTranscript } from 'src/front-components/hooks/use-call-recording-transcript';
import { type TranscriptEntry } from 'src/front-components/types/transcript-entry.type';
import { formatTranscriptTimestamp } from 'src/front-components/utils/format-transcript-timestamp.util';
import { parseTranscriptEntries } from 'src/front-components/utils/parse-transcript-entries.util';
import { parseTranscriptMarker } from 'src/logic-functions/domain/parse-transcript-marker.util';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

// Avoid the SDK UI entrypoint until its bundle is safe for the browser runtime.
const transcriptThemeCssVariables = {
  background: {
    transparentDanger: 'var(--t-background-transparent-danger)',
  },
  border: {
    colorDanger: 'var(--t-border-color-danger)',
    radiusMd: 'var(--t-border-radius-md)',
  },
  font: {
    colorDanger: 'var(--t-font-color-danger)',
    colorPrimary: 'var(--t-font-color-primary)',
    colorSecondary: 'var(--t-font-color-secondary)',
    colorTertiary: 'var(--t-font-color-tertiary)',
    family: 'var(--t-font-family)',
    sizeSm: 'var(--t-font-size-sm)',
    sizeXs: 'var(--t-font-size-xs)',
    weightMedium: 'var(--t-font-weight-medium)',
  },
  spacing: {
    1: 'var(--t-spacing-1)',
    2: 'var(--t-spacing-2)',
    3: 'var(--t-spacing-3)',
    4: 'var(--t-spacing-4)',
  },
} as const;

const StyledStateContainer = styled.div`
  box-sizing: border-box;
  font-family: ${transcriptThemeCssVariables.font.family};
  height: 100%;
  padding: ${transcriptThemeCssVariables.spacing[4]};
`;

const StyledCenteredState = styled(StyledStateContainer)`
  align-items: center;
  color: ${transcriptThemeCssVariables.font.colorTertiary};
  display: flex;
  font-size: ${transcriptThemeCssVariables.font.sizeSm};
  justify-content: center;
`;

const StyledTranscriptContainer = styled(StyledStateContainer)`
  display: flex;
  flex-direction: column;
  gap: ${transcriptThemeCssVariables.spacing[4]};
  overflow-y: auto;
`;

const StyledEntry = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${transcriptThemeCssVariables.spacing[1]};
`;

const StyledEntryHeader = styled.div`
  align-items: baseline;
  display: flex;
  gap: ${transcriptThemeCssVariables.spacing[2]};
`;

const StyledSpeakerName = styled.span`
  color: ${transcriptThemeCssVariables.font.colorPrimary};
  font-size: ${transcriptThemeCssVariables.font.sizeSm};
  font-weight: ${transcriptThemeCssVariables.font.weightMedium};
`;

const StyledTimestamp = styled.span`
  color: ${transcriptThemeCssVariables.font.colorTertiary};
  font-size: ${transcriptThemeCssVariables.font.sizeXs};
`;

const StyledEntryText = styled.p`
  color: ${transcriptThemeCssVariables.font.colorSecondary};
  font-size: ${transcriptThemeCssVariables.font.sizeSm};
  line-height: 1.5;
  margin: 0;
`;

const StyledErrorBox = styled.div`
  background: ${transcriptThemeCssVariables.background.transparentDanger};
  border: 1px solid ${transcriptThemeCssVariables.border.colorDanger};
  border-radius: ${transcriptThemeCssVariables.border.radiusMd};
  display: flex;
  flex-direction: column;
  gap: ${transcriptThemeCssVariables.spacing[1]};
  padding: ${transcriptThemeCssVariables.spacing[3]};
`;

const StyledErrorTitle = styled.span`
  color: ${transcriptThemeCssVariables.font.colorDanger};
  font-size: ${transcriptThemeCssVariables.font.sizeSm};
  font-weight: ${transcriptThemeCssVariables.font.weightMedium};
`;

const StyledErrorDescription = styled.span`
  color: ${transcriptThemeCssVariables.font.colorSecondary};
  font-size: ${transcriptThemeCssVariables.font.sizeSm};
`;

type TranscriptErrorBoxProps = {
  title: string;
  description: string;
};

const TranscriptErrorBox = ({
  title,
  description,
}: TranscriptErrorBoxProps) => (
  <StyledStateContainer>
    <StyledErrorBox>
      <StyledErrorTitle>{title}</StyledErrorTitle>
      <StyledErrorDescription>{description}</StyledErrorDescription>
    </StyledErrorBox>
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
          {!isUndefined(entry.startSeconds) && (
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
    selectedRecordIds.length === 1 ? selectedRecordIds[0] : undefined;

  const { transcript, loading, errorMessage } =
    useCallRecordingTranscript(callRecordingId);

  if (isUndefined(callRecordingId)) {
    return (
      <StyledCenteredState>
        Open a call recording to see its transcript.
      </StyledCenteredState>
    );
  }

  if (loading) {
    return <StyledCenteredState>Loading transcript…</StyledCenteredState>;
  }

  if (!isUndefined(errorMessage)) {
    return (
      <TranscriptErrorBox
        title="Failed to load the transcript"
        description={errorMessage}
      />
    );
  }

  if (isUndefined(transcript)) {
    return (
      <StyledCenteredState>
        No transcript for this recording yet.
      </StyledCenteredState>
    );
  }

  const marker = parseTranscriptMarker(transcript);

  if (marker?.status === 'PENDING') {
    return (
      <StyledCenteredState>
        The transcript is being generated. Check back in a few minutes.
      </StyledCenteredState>
    );
  }

  if (marker?.status === 'FAILED') {
    return (
      <TranscriptErrorBox
        title="Transcription failed"
        description={
          isNonEmptyString(marker.subCode)
            ? `The transcription provider could not process this recording (${marker.subCode}).`
            : 'The transcription provider could not process this recording.'
        }
      />
    );
  }

  const entries = parseTranscriptEntries(transcript);

  if (isUndefined(entries)) {
    return (
      <TranscriptErrorBox
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
