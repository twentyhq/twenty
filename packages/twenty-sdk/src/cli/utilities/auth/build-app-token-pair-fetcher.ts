import { type ApiService } from '@/cli/utilities/api/api-service';

// Builds the fetchTokenPair token source for
// ensureAppAccessTokenIsValidOrRefresh: mints a workspace-scoped app token
// pair via the generateApplicationToken mutation.
export const buildAppTokenPairFetcher =
  (apiService: ApiService, applicationId: string) =>
  async (): Promise<
    { accessToken: string; refreshToken?: string } | undefined
  > => {
    const tokenResult =
      await apiService.generateApplicationToken(applicationId);

    if (!tokenResult.success || !tokenResult.data) {
      return undefined;
    }

    return {
      accessToken: tokenResult.data.applicationAccessToken.token,
      refreshToken: tokenResult.data.applicationRefreshToken.token,
    };
  };
