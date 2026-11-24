import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SYNC_MEMBER_RECORDING_PREFERENCE_ROUTE_PATH } from 'src/constants/sync-member-recording-preference-route-path';
import { requestMemberRecordingPreferenceSync } from 'src/front-components/utils/request-member-recording-preference-sync.util';

const enqueueSnackbarMock = vi.hoisted(() => vi.fn());
const postMock = vi.hoisted(() => vi.fn());
const restApiClientMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-sdk/front-component', () => ({
  enqueueSnackbar: enqueueSnackbarMock,
  t: (message: string) => message,
}));

vi.mock('twenty-client-sdk/rest', () => ({
  RestApiClient: restApiClientMock,
}));

describe('requestMemberRecordingPreferenceSync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    restApiClientMock.mockImplementation(function RestApiClient() {
      return { post: postMock };
    });
    postMock.mockResolvedValue({ outcome: 'sweep-enqueued' });
  });

  it('posts the /s-prefixed route path and stays quiet when it succeeds', async () => {
    await requestMemberRecordingPreferenceSync();

    expect(postMock).toHaveBeenCalledWith(
      `/s${SYNC_MEMBER_RECORDING_PREFERENCE_ROUTE_PATH}`,
      {},
    );
    expect(enqueueSnackbarMock).not.toHaveBeenCalled();
  });

  it('tells the member when upcoming meetings could not be updated', async () => {
    postMock.mockRejectedValue(new Error('route unavailable'));

    await requestMemberRecordingPreferenceSync();

    expect(enqueueSnackbarMock).toHaveBeenCalledWith(
      expect.objectContaining({ variant: 'error' }),
    );
  });
});
