export type ReconcileItem = { id?: string };
export type ReconcilePlan<T> = { toCreate: T[]; toUpdate: T[]; toDelete: string[] };

// existingIds = ids currently owned by the caller's partner.
// incoming = desired rows. Rows with an id NOT in existingIds are rejected (return null → caller 403s).
export const buildReconcilePlan = <T extends ReconcileItem>(
  existingIds: string[],
  incoming: T[],
): ReconcilePlan<T> | null => {
  const owned = new Set(existingIds);
  const keptIds = new Set<string>();
  const toCreate: T[] = [];
  const toUpdate: T[] = [];
  for (const item of incoming) {
    if (item.id === undefined) {
      toCreate.push(item);
      continue;
    }
    if (!owned.has(item.id)) return null; // foreign / stale id → refuse the whole batch
    if (keptIds.has(item.id)) return null; // same id submitted twice → refuse the whole batch
    keptIds.add(item.id);
    toUpdate.push(item);
  }
  const toDelete = existingIds.filter((id) => !keptIds.has(id));
  return { toCreate, toUpdate, toDelete };
};
