export const includesExpectedScopes = (
  scopes: string[],
  expectedScopes: string[],
): boolean => {
  return expectedScopes.every(
    (expectedScope) =>
      scopes.includes(expectedScope) ||
      scopes.includes(
        `https://www.googleapis.com/auth/userinfo.${expectedScope}`,
      ),
  );
};
