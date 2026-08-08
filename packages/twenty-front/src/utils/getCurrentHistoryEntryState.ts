// The state react-router attached to the current history entry, read from the
// browser at call time. Callers run from callbacks that outlive the render
// they were created in — a send that awaited a thread id, a mutation's
// onCompleted — where a value captured by useLocation would be stale, and
// replacing the entry with stale state silently drops what it carried.
// react-router keeps the caller's state under `usr` on the history entry.
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
