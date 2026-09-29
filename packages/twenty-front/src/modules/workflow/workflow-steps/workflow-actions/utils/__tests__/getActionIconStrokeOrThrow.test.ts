import { getActionIconStrokeOrThrow } from '@/workflow/workflow-steps/workflow-actions/utils/getActionIconStrokeOrThrow';

describe('getActionIconStrokeOrThrow', () => {
  it.each([
    'CODE',
    'LOGIC_FUNCTION',
    'HTTP_REQUEST',
    'SEND_EMAIL',
    'DRAFT_EMAIL',
    'CREATE_CALENDAR_EVENT',
    'CREATE_RECORD',
    'UPDATE_RECORD',
    'DELETE_RECORD',
    'UPSERT_RECORD',
    'FIND_RECORDS',
    'PICK_RECORD',
    'IF_ELSE',
  ] as const)('preserves the small stroke for %s', (type) => {
    expect(getActionIconStrokeOrThrow(type)).toBe('sm');
  });

  it.each([
    'FORM',
    'ITERATOR',
    'EMPTY',
    'FILTER',
    'DELAY',
    'AI_AGENT',
    'CLASSIFY',
  ] as const)('preserves the default stroke for %s', (type) => {
    expect(getActionIconStrokeOrThrow(type)).toBeUndefined();
  });
});
