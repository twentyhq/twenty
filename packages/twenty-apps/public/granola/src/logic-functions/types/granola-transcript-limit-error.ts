import {
  GRANOLA_TRANSCRIPT_MAX_PAGES,
  GRANOLA_TRANSCRIPT_TIMEOUT_MILLISECONDS,
} from 'src/constants/granola-transcript.constant';

export class GranolaTranscriptLimitError extends Error {
  constructor(
    options:
      | { reason: 'page-limit' | 'time-limit' }
      | {
          reason: 'non-advancing-cursor';
          noteId: string;
          cursor: string | null;
        },
  ) {
    super(
      options.reason === 'non-advancing-cursor'
        ? `Granola transcript pagination did not advance for note ${options.noteId} at cursor ${options.cursor ?? 'none'}.`
        : options.reason === 'page-limit'
          ? `Granola transcript exceeded the ${GRANOLA_TRANSCRIPT_MAX_PAGES.toLocaleString('en-US')}-page import limit.`
          : `Granola transcript exceeded the ${GRANOLA_TRANSCRIPT_TIMEOUT_MILLISECONDS / 1_000}-second import limit.`,
    );
    this.name = 'GranolaTranscriptLimitError';
  }
}
