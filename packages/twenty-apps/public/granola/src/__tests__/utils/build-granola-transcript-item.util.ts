import { type GranolaTranscriptItem } from 'src/logic-functions/types/granola-api.type';

export const buildGranolaTranscriptItem = (
  overrides: Partial<GranolaTranscriptItem> = {},
): GranolaTranscriptItem => ({
  speaker: { source: 'microphone', attribution: 'me' },
  text: 'Hello',
  start_time: '2026-09-05T10:00:05Z',
  end_time: '2026-09-05T10:00:07Z',
  ...overrides,
});
