export type AuthToken = {
    token: string;
    expiresAt: Date;
}

export type ExchangeAuthCodeInput = {
    authorizationCode: string;
    codeVerifier?: string;
    clientSecret?: string;
}

export type ExchangeAuthCodeResponse = {
    loginToken: AuthToken;
    authToken: AuthToken;
    refreshToken: AuthToken;
}