export type IdsDiff = {
  idsToCreate: string[];
  idsToUpdate: string[];
  idsToDelete: string[];
};

export const computeIdsDiff = (
  existingIds: string[],
  receivedIds: string[],
): IdsDiff => {
  const idsToCreate = receivedIds.filter((id) => !existingIds.includes(id));
  const idsToUpdate = receivedIds.filter((id) => existingIds.includes(id));
  const idsToDelete = existingIds.filter((id) => !receivedIds.includes(id));

  return {
    idsToCreate,
    idsToUpdate,
    idsToDelete,
  };
};
