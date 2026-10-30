import {
  isAcceptableExpiresInSeconds,
  parseTokenResponse,
} from "src/engine/core-modules/application/connection-provider/utils/parse-token-response.util";

const ONE_YEAR_SECONDS = 365 * 24 * 3600;

describe("parseTokenResponse", () => {
  it("parses a numeric OAuth expires_in and the rest of the token payload", () => {
    const parsed = parseTokenResponse({
      access_token: "ory_at_test_123",
      refresh_token: "ory_rt_test_456",
      id_token: "header.payload.sig",
      expires_in: 300,
      token_type: "Bearer",
      scope: "offline_access read write",
    });

    expect(parsed.accessToken).toBe("ory_at_test_123");
    expect(parsed.refreshToken).toBe("ory_rt_test_456");
    expect(parsed.idToken).toBe("header.payload.sig");
    expect(parsed.expiresIn).toBe(300);
    expect(parsed.scopes).toEqual(["offline_access", "read", "write"]);
  });

  it.each([
    ["3600", 3600],
    [" 300 ", 300],
    ["+300", 300],
    ["300.0", 300],
  ])("parses decimal string expires_in %j as %d", (raw, expected) => {
    const parsed = parseTokenResponse({
      access_token: "token_abc",
      expires_in: raw,
    });

    expect(parsed.expiresIn).toBe(expected);
  });

  it("accepts exactly one year and rejects one second past it", () => {
    expect(
      parseTokenResponse({
        access_token: "token",
        expires_in: ONE_YEAR_SECONDS,
      }).expiresIn,
    ).toBe(ONE_YEAR_SECONDS);

    expect(
      parseTokenResponse({
        access_token: "token",
        expires_in: ONE_YEAR_SECONDS + 1,
      }).expiresIn,
    ).toBeNull();
  });

  it("falls back to null when expires_in is omitted", () => {
    const parsed = parseTokenResponse({
      access_token: "token_xyz",
    });

    expect(parsed.expiresIn).toBeNull();
    expect(parsed.refreshToken).toBeNull();
    expect(parsed.idToken).toBeNull();
    expect(parsed.scopes).toBeNull();
  });

  it.each([
    ["NaN", Number.NaN],
    ["Infinity", Number.POSITIVE_INFINITY],
    ["-Infinity", Number.NEGATIVE_INFINITY],
    ["zero", 0],
    ["negative number", -30],
    ["empty string", ""],
    ["blank string", "   "],
    ["non-numeric text", "soon"],
    ["numeric prefix", "300abc"],
    ["hex string", "0x12c"],
    ["scientific string", "1e3"],
    ["Infinity string", "Infinity"],
    ["NaN string", "NaN"],
    ["string zero", "0"],
    ["string negative", "-5"],
    ["string past one year", String(ONE_YEAR_SECONDS + 1)],
    ["null", null],
    ["boolean", true],
    ["object", { seconds: 300 }],
    ["array", [300]],
  ])("falls back to null for illegal expires_in (%s)", (_label, expiresIn) => {
    const parsed = parseTokenResponse({
      access_token: "token",
      expires_in: expiresIn as never,
    });

    expect(parsed.expiresIn).toBeNull();
    expect(isAcceptableExpiresInSeconds(parsed.expiresIn)).toBe(false);
  });

  it("throws when access_token is missing and does not return a partial payload", () => {
    expect(() => {
      parseTokenResponse({ error: "invalid_grant", expires_in: 300 });
    }).toThrow("Token endpoint did not return an access_token");
  });
});
