import { type TokenExchangeResponse } from "src/engine/core-modules/application/connection-provider/types/token-exchange-response.type";
import { type PlaintextString } from "src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type";

const MAX_OAUTH_EXPIRES_IN_SECONDS = 365 * 24 * 3600;

// Base-10 only. Number("0x12c"), Number("Infinity") and Number("1e3") are rejected.
const DECIMAL_EXPIRES_IN_SECONDS = /^\+?(?:\d+\.\d+|\d+)$/;

export const isAcceptableExpiresInSeconds = (value: unknown): value is number =>
  typeof value === "number" &&
  Number.isFinite(value) &&
  value > 0 &&
  value <= MAX_OAUTH_EXPIRES_IN_SECONDS;

const parseExpiresIn = (rawExpiresIn: unknown): number | null => {
  if (typeof rawExpiresIn === "number") {
    return isAcceptableExpiresInSeconds(rawExpiresIn) ? rawExpiresIn : null;
  }

  if (typeof rawExpiresIn !== "string") {
    return null;
  }

  const trimmed = rawExpiresIn.trim();

  if (!DECIMAL_EXPIRES_IN_SECONDS.test(trimmed)) {
    return null;
  }

  const parsed = Number(trimmed);

  return isAcceptableExpiresInSeconds(parsed) ? parsed : null;
};

export const parseTokenResponse = (json: Record<string, unknown>): TokenExchangeResponse => {
  const accessToken =
    typeof json.access_token === "string" ? (json.access_token as PlaintextString) : null;

  if (!accessToken) {
    throw new Error(
      `Token endpoint did not return an access_token. Response keys: ${Object.keys(json).join(", ")}`,
    );
  }

  return {
    accessToken,
    refreshToken:
      typeof json.refresh_token === "string" ? (json.refresh_token as PlaintextString) : null,
    idToken: typeof json.id_token === "string" ? (json.id_token as PlaintextString) : null,
    scopes: typeof json.scope === "string" ? json.scope.split(/[\s,]+/).filter(Boolean) : null,
    expiresIn: parseExpiresIn(json.expires_in),
  };
};
