import {
  GRANOLA_TRANSCRIPT_MAX_PAGES,
  GRANOLA_TRANSCRIPT_TIMEOUT_MILLISECONDS,
} from 'src/constants/granola-transcript.constant';

type GranolaTranscriptLimitErrorOptions =
  | { reason: 'page-limit' | 'time-limit' }
  | {
      reason: 'non-advancing-cursor';
      noteId: string;
      cursor: string | null;
    };

export class GranolaTranscriptLimitError extends Error {
  constructor(options: GranolaTranscriptLimitErrorOptions) {
    super(GranolaTranscriptLimitError.getMessage(options));
    this.name = 'GranolaTranscriptLimitError';
  }

  private static getMessage(
    options: GranolaTranscriptLimitErrorOptions,
  ): string {
    if (options.reason === 'non-advancing-cursor') {
      return `Granola transcript pagination did not advance for note ${options.noteId} at cursor ${options.cursor ?? 'none'}.`;
    }

    if (options.reason === 'page-limit') {
      return `Granola transcript exceeded the ${GRANOLA_TRANSCRIPT_MAX_PAGES.toLocaleString('en-US')}-page import limit.`;
    }

    return `Granola transcript exceeded the ${GRANOLA_TRANSCRIPT_TIMEOUT_MILLISECONDS / 1_000}-second import limit.`;
  }
}
