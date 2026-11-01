export const restoreUnchangedComputedStyle = <
  TSnapshot extends { computedStyle?: Record<string, string> },
>({
  previousSnapshot,
  nextSnapshot,
}: {
  previousSnapshot: TSnapshot | null | undefined;
  nextSnapshot: TSnapshot;
}): TSnapshot => ({
  ...nextSnapshot,
  computedStyle: nextSnapshot.computedStyle ?? previousSnapshot?.computedStyle,
});
