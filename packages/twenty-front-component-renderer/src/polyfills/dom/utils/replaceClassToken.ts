export const replaceClassToken = ({
  currentTokens,
  oldToken,
  newToken,
}: {
  currentTokens: string[];
  oldToken: string;
  newToken: string;
}): string[] => {
  const firstOccurrenceIndexOfOldOrNewToken = currentTokens.findIndex(
    (currentToken) => currentToken === oldToken || currentToken === newToken,
  );

  const tokensWithoutOldAndNewToken = currentTokens.filter(
    (currentToken) => currentToken !== oldToken && currentToken !== newToken,
  );

  return [
    ...tokensWithoutOldAndNewToken.slice(
      0,
      firstOccurrenceIndexOfOldOrNewToken,
    ),
    newToken,
    ...tokensWithoutOldAndNewToken.slice(firstOccurrenceIndexOfOldOrNewToken),
  ];
};
