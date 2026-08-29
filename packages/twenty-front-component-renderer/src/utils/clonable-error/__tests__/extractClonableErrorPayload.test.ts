import { FRONT_COMPONENT_THREAD_ERROR_MARKER } from '@/constants/FrontComponentThreadErrorMarker';

import { extractClonableErrorPayload } from '../extractClonableErrorPayload';

describe('extractClonableErrorPayload', () => {
  it('should extract a marked payload', () => {
    expect(
      extractClonableErrorPayload({
        [FRONT_COMPONENT_THREAD_ERROR_MARKER]: {
          name: 'NS_ERROR_FAILURE',
          message: '[Exception...]',
          stack: '@blob:null/uuid:5:15',
          code: 'SOME_CODE',
        },
      }),
    ).toEqual({
      name: 'NS_ERROR_FAILURE',
      message: '[Exception...]',
      stack: '@blob:null/uuid:5:15',
      code: 'SOME_CODE',
    });
  });

  it('should drop non-string stack and code fields', () => {
    expect(
      extractClonableErrorPayload({
        [FRONT_COMPONENT_THREAD_ERROR_MARKER]: {
          name: 'Error',
          message: 'boom',
          stack: 42,
          code: { nested: true },
        },
      }),
    ).toEqual({
      name: 'Error',
      message: 'boom',
      stack: undefined,
      code: undefined,
    });
  });

  it('should return null for unmarked objects', () => {
    expect(
      extractClonableErrorPayload({ name: 'Error', message: 'boom' }),
    ).toBe(null);
  });

  it('should return null when the marked payload is malformed', () => {
    expect(
      extractClonableErrorPayload({
        [FRONT_COMPONENT_THREAD_ERROR_MARKER]: { message: 42 },
      }),
    ).toBe(null);

    expect(
      extractClonableErrorPayload({
        [FRONT_COMPONENT_THREAD_ERROR_MARKER]: 'boom',
      }),
    ).toBe(null);
  });
});
