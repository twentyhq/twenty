import { fastDeepEqual, isDefined } from 'twenty-shared/utils';

export const omitUnchangedComputedStyle = <
  TSnapshot extends { computedStyle?: Record<string, string> },
>({
  previousSnapshot,
  nextSnapshot,
}: {
  previousSnapshot: TSnapshot | null | undefined;
  nextSnapshot: TSnapshot;
}): TSnapshot =>
  isDefined(previousSnapshot) &&
  fastDeepEqual(previousSnapshot.computedStyle, nextSnapshot.computedStyle)
    ? { ...nextSnapshot, computedStyle: undefined }
    : nextSnapshot;
