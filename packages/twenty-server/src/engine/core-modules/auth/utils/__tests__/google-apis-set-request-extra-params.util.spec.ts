import { type GoogleAPIsRequest } from 'src/engine/core-modules/auth/types/google-api-request.type';
import { setRequestExtraParams } from 'src/engine/core-modules/auth/utils/google-apis-set-request-extra-params.util';
import { CalendarChannelVisibility } from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';
import { MessageChannelVisibility } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';

describe('googleApisSetRequestExtraParams', () => {
  it('should set request extra params', () => {
    const request = {
      params: {},
    } as GoogleAPIsRequest;

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
    } as GoogleAPIsRequest;

    expect(() => {
      setRequestExtraParams(request, {
        redirectLocation: '/test',
        calendarVisibility: CalendarChannelVisibility.SHARE_EVERYTHING,
        messageVisibility: MessageChannelVisibility.SHARE_EVERYTHING,
      });
    }).toThrow('transientToken is required');
  });
});
