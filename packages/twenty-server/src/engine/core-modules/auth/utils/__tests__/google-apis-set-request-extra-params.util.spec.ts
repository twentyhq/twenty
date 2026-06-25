import {
  CalendarChannelVisibility,
  MessageChannelVisibility,
} from 'twenty-shared/types';
import { type APIsOAuthRequest } from 'src/engine/core-modules/auth/types/apis-oauth-request.type';
import { setRequestExtraParams } from 'src/engine/core-modules/auth/utils/google-apis-set-request-extra-params.util';

describe('googleApisSetRequestExtraParams', () => {
  it('should set request extra params', () => {
    const request = {
      params: {},
    } as APIsOAuthRequest;

    setRequestExtraParams(request, {
      transientToken: 'abc',
      redirectLocation: '/test',
      calendarVisibility: CalendarChannelVisibility.SHARE_EVERYTHING,
      messageVisibility: MessageChannelVisibility.SHARE_EVERYTHING,
    });

    expect(request.params).toEqual({
      transientToken: 'abc',
      redirectLocation: '/test',
      calendarVisibility: CalendarChannelVisibility.SHARE_EVERYTHING,
      messageVisibility: MessageChannelVisibility.SHARE_EVERYTHING,
    });
  });

  it('should throw error if transientToken is not provided', () => {
    const request = {
      params: {},
    } as APIsOAuthRequest;

    expect(() => {
      setRequestExtraParams(request, {
        redirectLocation: '/test',
        calendarVisibility: CalendarChannelVisibility.SHARE_EVERYTHING,
        messageVisibility: MessageChannelVisibility.SHARE_EVERYTHING,
      });
    }).toThrow('transientToken is required');
  });
});
