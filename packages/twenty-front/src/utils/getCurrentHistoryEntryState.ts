export const getCurrentHistoryEntryState = (): unknown => {
  const historyState: unknown = window.history.state;

  if (
    typeof historyState !== 'object' ||
    historyState === null ||
    !('usr' in historyState)
  ) {
    return null;
  }

  return historyState.usr;
};
