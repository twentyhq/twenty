import { GoogleAPIsRequest } from 'src/engine/core-modules/auth/types/google-api-request.type';
import { setRequestExtraParams } from 'src/engine/core-modules/auth/utils/google-apis-set-request-extra-params.util';

describe('googleApisSetRequestExtraParams', () => {
  it('should set request extra params', () => {
    const request = {
      params: {},
    } as GoogleAPIsRequest;

    setRequestExtraParams(request, {
      transientToken: 'abc',
      redirectLocation: '/test',
      calendarVisibility: 'share_everything',
      messageVisibility: 'share_everything',
    });

    expect(request.params).toEqual({
      transientToken: 'abc',
      redirectLocation: '/test',
      calendarVisibility: 'share_everything',
      messageVisibility: 'share_everything',
    });
  });

  it('should throw error if transientToken is not provided', () => {
    const request = {
      params: {},
    } as GoogleAPIsRequest;

    expect(() => {
      setRequestExtraParams(request, {
        redirectLocation: '/test',
        calendarVisibility: 'share_everything',
        messageVisibility: 'share_everything',
      });
    }).toThrow('transientToken is required');
  });
});
