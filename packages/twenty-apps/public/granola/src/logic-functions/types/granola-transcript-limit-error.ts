import {
  GRANOLA_TRANSCRIPT_MAX_PAGES,
  GRANOLA_TRANSCRIPT_TIMEOUT_MILLISECONDS,
} from 'src/constants/granola-transcript.constant';

export class GranolaTranscriptLimitError extends Error {
  constructor({ reason }: { reason: 'page-limit' | 'time-limit' }) {
    super(
      reason === 'page-limit'
        ? `Granola transcript exceeded the ${GRANOLA_TRANSCRIPT_MAX_PAGES.toLocaleString('en-US')}-page import limit.`
        : `Granola transcript exceeded the ${GRANOLA_TRANSCRIPT_TIMEOUT_MILLISECONDS / 1_000}-second import limit.`,
    );
    this.name = 'GranolaTranscriptLimitError';
  }
}
