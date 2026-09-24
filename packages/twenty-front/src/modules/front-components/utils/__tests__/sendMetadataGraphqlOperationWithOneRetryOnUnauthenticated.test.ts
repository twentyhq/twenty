import { type MetadataGraphqlResponse } from '@/front-components/types/MetadataGraphqlResponse';
import { sendMetadataGraphqlOperationWithOneRetryOnUnauthenticated } from '@/front-components/utils/sendMetadataGraphqlOperationWithOneRetryOnUnauthenticated';

type UploadTarget = { fileId: string };

const APPLICATION_ACCESS_TOKEN = 'application-access-token';
const REFRESHED_ACCESS_TOKEN = 'refreshed-access-token';

const successResponse: MetadataGraphqlResponse<UploadTarget> = {
  status: 200,
  payload: { data: { fileId: 'file-1' } },
};

const unauthenticatedErrorResponse: MetadataGraphqlResponse<UploadTarget> = {
  status: 200,
  payload: {
    errors: [
      { message: 'Unauthorized', extensions: { code: 'UNAUTHENTICATED' } },
    ],
  },
};

const unauthorizedStatusResponse: MetadataGraphqlResponse<UploadTarget> = {
  status: 401,
  payload: null,
};

const permissionDeniedResponse: MetadataGraphqlResponse<UploadTarget> = {
  status: 200,
  payload: {
    errors: [
      {
        message: 'User does not have permission.',
        extensions: { code: 'FORBIDDEN', subCode: 'PERMISSION_DENIED' },
      },
    ],
  },
};

describe('sendMetadataGraphqlOperationWithOneRetryOnUnauthenticated', () => {
  const sendOperation = jest.fn();
  const requestAccessTokenRefresh = jest.fn();

  const sendUploadTargetOperation = () =>
    sendMetadataGraphqlOperationWithOneRetryOnUnauthenticated<UploadTarget>({
      applicationAccessToken: APPLICATION_ACCESS_TOKEN,
      requestAccessTokenRefresh,
      sendOperation,
    });

  beforeEach(() => {
    jest.resetAllMocks();
    requestAccessTokenRefresh.mockResolvedValue(REFRESHED_ACCESS_TOKEN);
  });

  it('returns the first response without refreshing the access token when it is authenticated', async () => {
    sendOperation.mockResolvedValueOnce(successResponse);

    await expect(sendUploadTargetOperation()).resolves.toBe(successResponse);

    expect(sendOperation.mock.calls).toEqual([[APPLICATION_ACCESS_TOKEN]]);
    expect(requestAccessTokenRefresh).not.toHaveBeenCalled();
  });

  it.each([
    {
      label: 'an UNAUTHENTICATED error',
      unauthenticatedResponse: unauthenticatedErrorResponse,
    },
    {
      label: 'a 401 status',
      unauthenticatedResponse: unauthorizedStatusResponse,
    },
  ])(
    'resends the operation once with a refreshed access token after $label',
    async ({ unauthenticatedResponse }) => {
      sendOperation
        .mockResolvedValueOnce(unauthenticatedResponse)
        .mockResolvedValueOnce(successResponse);

      await expect(sendUploadTargetOperation()).resolves.toBe(successResponse);

      expect(requestAccessTokenRefresh).toHaveBeenCalledTimes(1);
      expect(sendOperation.mock.calls).toEqual([
        [APPLICATION_ACCESS_TOKEN],
        [REFRESHED_ACCESS_TOKEN],
      ]);
    },
  );

  it('returns the resent response without refreshing again when the refreshed access token is still refused', async () => {
    sendOperation.mockResolvedValue(unauthenticatedErrorResponse);

    await expect(sendUploadTargetOperation()).resolves.toBe(
      unauthenticatedErrorResponse,
    );

    expect(requestAccessTokenRefresh).toHaveBeenCalledTimes(1);
    expect(sendOperation).toHaveBeenCalledTimes(2);
  });

  it('does not refresh the access token when the operation is refused for another reason', async () => {
    sendOperation.mockResolvedValueOnce(permissionDeniedResponse);

    await expect(sendUploadTargetOperation()).resolves.toBe(
      permissionDeniedResponse,
    );

    expect(sendOperation).toHaveBeenCalledTimes(1);
    expect(requestAccessTokenRefresh).not.toHaveBeenCalled();
  });

  it('does not resend the operation when the access token refresh fails', async () => {
    sendOperation.mockResolvedValueOnce(unauthenticatedErrorResponse);
    requestAccessTokenRefresh.mockRejectedValueOnce(
      new Error('Failed to renew application token'),
    );

    await expect(sendUploadTargetOperation()).rejects.toThrow(
      'Failed to renew application token',
    );

    expect(sendOperation).toHaveBeenCalledTimes(1);
  });
});
