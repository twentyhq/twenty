import { formatCallRecordingTranscriptTimestamp } from '@/page-layout/widgets/call-recording-transcript/utils/formatCallRecordingTranscriptTimestamp';
import { hasCallRecordingTranscriptSpeakerNames } from '@/page-layout/widgets/call-recording-transcript/utils/hasCallRecordingTranscriptSpeakerNames';
import { t } from '@lingui/core/macro';
import { type CallRecordingParsedTranscriptEntry } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const buildCallRecordingTranscriptPlainText = (
  entries: CallRecordingParsedTranscriptEntry[],
): string => {
  const hasSpeakerNames = hasCallRecordingTranscriptSpeakerNames(entries);

  return entries
    .map((entry) => {
      const timestamp = isDefined(entry.startSeconds)
        ? formatCallRecordingTranscriptTimestamp(entry.startSeconds)
        : undefined;

      if (!hasSpeakerNames) {
        return isDefined(timestamp)
          ? `${timestamp}\n${entry.text}`
          : entry.text;
      }

      const speakerName = entry.speakerName ?? t`Unknown speaker`;

      return isDefined(timestamp)
        ? `${speakerName} (${timestamp})\n${entry.text}`
        : `${speakerName}\n${entry.text}`;
    })
    .join('\n\n');
};
