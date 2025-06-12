import { getActionHeaderTypeOrThrow } from '../getActionHeaderTypeOrThrow';

describe('getActionHeaderTypeOrThrow', () => {
  it('should return "Code" for CODE action type', () => {
    expect(getActionHeaderTypeOrThrow('CODE').message).toBe('Code');
  });

  it('should return "Action" for record-related action types', () => {
    const recordActionTypes = [
      'CREATE_RECORD',
      'UPDATE_RECORD',
      'DELETE_RECORD',
      'FIND_RECORDS',
    ] as const;

    recordActionTypes.forEach((type) => {
      expect(getActionHeaderTypeOrThrow(type).message).toBe('Action');
    });
  });

  it('should return "Action" for FORM action type', () => {
    expect(getActionHeaderTypeOrThrow('FORM').message).toBe('Action');
  });

  it('should return "Action" for SEND_EMAIL action type', () => {
    expect(getActionHeaderTypeOrThrow('SEND_EMAIL').message).toBe('Action');
  });

  it('should return "HTTP Request" for HTTP_REQUEST action type', () => {
    expect(getActionHeaderTypeOrThrow('HTTP_REQUEST').message).toBe(
      'HTTP Request',
    );
  });

  it('should throw error for unknown action type', () => {
    // @ts-expect-error Testing invalid action type
    expect(() => getActionHeaderTypeOrThrow('UNKNOWN_ACTION')).toThrow(
      'Unsupported action type: UNKNOWN_ACTION',
    );
  });
});
