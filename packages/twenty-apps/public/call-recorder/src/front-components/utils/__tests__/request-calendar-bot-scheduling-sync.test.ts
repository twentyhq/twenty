import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SYNC_CALENDAR_BOT_SCHEDULING_ROUTE_PATH } from 'src/constants/sync-calendar-bot-scheduling-route-path';
import { requestCalendarBotSchedulingSync } from 'src/front-components/utils/request-calendar-bot-scheduling-sync.util';

const enqueueSnackbarMock = vi.hoisted(() => vi.fn());
const postMock = vi.hoisted(() => vi.fn());
const restApiClientMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-sdk/front-component', () => ({
  enqueueSnackbar: enqueueSnackbarMock,
}));

vi.mock('twenty-client-sdk/rest', () => ({
  RestApiClient: restApiClientMock,
}));

describe('requestCalendarBotSchedulingSync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    restApiClientMock.mockImplementation(function RestApiClient() {
      return { post: postMock };
    });
    postMock.mockResolvedValue({ outcome: 'apply-enqueued' });
  });

  it('posts the /s-prefixed route path', async () => {
    await requestCalendarBotSchedulingSync();

    expect(postMock).toHaveBeenCalledWith(
      `/s${SYNC_CALENDAR_BOT_SCHEDULING_ROUTE_PATH}`,
      {},
    );
  });

  it('shows nothing once the change is queued', async () => {
    await requestCalendarBotSchedulingSync();

    expect(enqueueSnackbarMock).not.toHaveBeenCalled();
  });

  it('reports a failed request', async () => {
    postMock.mockRejectedValue(new Error('Request failed'));

    await requestCalendarBotSchedulingSync();

    expect(enqueueSnackbarMock).toHaveBeenCalledExactlyOnceWith({
      message:
        'Setting saved, but scheduled recordings could not be updated yet.',
      variant: 'error',
    });
  });
});
