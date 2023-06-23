import { cookieStorage } from '@/utils/cookie-storage';
import { AuthTokenPair } from '~/generated/graphql';

export class TokenService {
  getTokenPair() {
    const accessToken = cookieStorage.getItem('accessToken');
    const refreshToken = cookieStorage.getItem('refreshToken');

    if (!accessToken || !refreshToken) {
      return null;
    }

    return {
      accessToken,
      refreshToken,
    };
  }

  setTokenPair(tokens: AuthTokenPair) {
    cookieStorage.setItem('accessToken', tokens.accessToken.token, {
      secure: true,
    });
    cookieStorage.setItem('refreshToken', tokens.refreshToken.token, {
      secure: true,
    });
  }

  removeTokenPair() {
    cookieStorage.removeItem('accessToken');
    cookieStorage.removeItem('refreshToken');
  }
}

export const tokenService = new TokenService();
