import { formatCallRecordingTranscriptTimestamp } from '@/page-layout/widgets/call-recording-transcript/utils/formatCallRecordingTranscriptTimestamp';
import { t } from '@lingui/core/macro';
import { type CallRecordingParsedTranscriptEntry } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const buildCallRecordingTranscriptPlainText = (
  entries: CallRecordingParsedTranscriptEntry[],
): string =>
  entries
    .map((entry) => {
      const speakerName = entry.speakerName ?? t`Unknown speaker`;
      const timestamp = isDefined(entry.startSeconds)
        ? ` (${formatCallRecordingTranscriptTimestamp(entry.startSeconds)})`
        : '';

      return `${speakerName}${timestamp}\n${entry.text}`;
    })
    .join('\n\n');
