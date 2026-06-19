import styled from '@emotion/styled';
import { isUndefined } from '@sniptt/guards';
import { useMemo } from 'react';

import { TranscriptEntryList } from 'src/front-components/components/TranscriptEntryList';
import { TranscriptErrorBox } from 'src/front-components/components/TranscriptErrorBox';
import { recordingThemeCssVariables } from 'src/front-components/constants/recording-theme-css-variables';
import { parseTranscriptEntries } from 'src/front-components/utils/parse-transcript-entries.util';
import { parseTranscriptMarker } from 'src/logic-functions/domain/parse-transcript-marker.util';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

const StyledTranscriptCenteredState = styled.div`
  align-items: center;
  color: ${recordingThemeCssVariables.font.colorTertiary};
  display: flex;
  flex: 1;
  font-size: ${recordingThemeCssVariables.font.sizeSm};
  justify-content: center;
  padding: ${recordingThemeCssVariables.spacing[4]};
`;

type RecordingTranscriptProps = {
  transcript: unknown;
  currentTimeSeconds: number;
};

export const RecordingTranscript = ({
  transcript,
  currentTimeSeconds,
}: RecordingTranscriptProps) => {
  const marker = useMemo(() => parseTranscriptMarker(transcript), [transcript]);
  const entries = useMemo(
    () => parseTranscriptEntries(transcript),
    [transcript],
  );

  if (isUndefined(transcript)) {
    return (
      <StyledTranscriptCenteredState>
        No transcript for this calendar event yet.
      </StyledTranscriptCenteredState>
    );
  }

  if (marker?.status === 'PENDING') {
    return (
      <StyledTranscriptCenteredState>
        The transcript is being generated. Check back in a few minutes.
      </StyledTranscriptCenteredState>
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

  if (isUndefined(entries)) {
    return (
      <TranscriptErrorBox
        title="Unrecognized transcript format"
        description="The stored transcript does not match the expected diarized format."
      />
    );
  }

  if (entries.length === 0) {
    return (
      <StyledTranscriptCenteredState>
        The transcript is empty.
      </StyledTranscriptCenteredState>
    );
  }

  return (
    <TranscriptEntryList
      entries={entries}
      currentTimeSeconds={currentTimeSeconds}
    />
  );
};
