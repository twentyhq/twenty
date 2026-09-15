import { CustomError } from 'twenty-shared/utils';

import { rehydrateClonableError } from '../rehydrateClonableError';

describe('rehydrateClonableError', () => {
  it('should rebuild an Error with name, message and stack', () => {
    const error = rehydrateClonableError({
      name: 'NS_ERROR_FAILURE',
      message: '[Exception...]',
      stack: '@blob:null/uuid:5:15',
    });

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('NS_ERROR_FAILURE');
    expect(error.message).toBe('[Exception...]');
    expect(error.stack).toBe('@blob:null/uuid:5:15');
  });

  it('should rebuild a CustomError when a code is present', () => {
    const error = rehydrateClonableError({
      name: 'CustomError',
      message: 'fetch bridge unavailable',
      code: 'FETCH_BRIDGE',
    });

    expect(error).toBeInstanceOf(CustomError);
    expect(error.message).toBe('fetch bridge unavailable');
    expect(error).toMatchObject({ code: 'FETCH_BRIDGE' });
  });

  it('should keep the generated stack when the payload has none', () => {
    const error = rehydrateClonableError({ name: 'Error', message: 'boom' });

    expect(error.stack).toEqual(expect.any(String));
  });
});
