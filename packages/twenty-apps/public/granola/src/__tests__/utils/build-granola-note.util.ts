import { type GranolaNote } from 'src/logic-functions/types/granola-api.type';

export const buildGranolaNote = (
  overrides: Partial<GranolaNote> = {},
): GranolaNote => ({
  id: 'not_1d3tmYTlCICgjy',
  object: 'note',
  title: 'Customer meeting',
  owner: { name: 'Alice', email: 'alice@example.com' },
  created_at: '2026-09-05T10:00:00Z',
  updated_at: '2026-09-05T11:00:00Z',
  web_url: 'https://notes.granola.ai/d/meeting',
  calendar_event: null,
  attendees: [],
  folder_membership: [],
  summary_text: 'Shared summary',
  summary_markdown: '## Shared summary',
  transcript: null,
  ...overrides,
});
