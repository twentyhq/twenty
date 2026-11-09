import { type FilePart, type TextPart } from 'ai';

import { UNDELIVERED_FILE_REASON } from 'src/engine/metadata-modules/ai/ai-agent-execution/constants/undelivered-file-reason.constant';
import { formatUnsupportedFilePlaceholder } from 'src/engine/metadata-modules/ai/ai-models/utils/format-unsupported-file-placeholder.util';

export const buildFilePlaceholder = ({
  part: { filename, mediaType },
  reason,
}: {
  part: Pick<FilePart, 'filename' | 'mediaType'>;
  reason?: keyof typeof UNDELIVERED_FILE_REASON;
}): TextPart => ({
  type: 'text',
  text: formatUnsupportedFilePlaceholder({
    filename,
    mediaType,
    reason: reason && UNDELIVERED_FILE_REASON[reason],
  }),
});
