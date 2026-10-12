export const getRecordIdsBetween = ({
  recordIds,
  firstRecordId,
  secondRecordId,
}: {
  recordIds: string[];
  firstRecordId: string;
  secondRecordId: string;
}) => {
  const firstIndex = recordIds.indexOf(firstRecordId);
  const secondIndex = recordIds.indexOf(secondRecordId);

  if (firstIndex === -1 || secondIndex === -1) {
    return [];
  }

  return recordIds.slice(
    Math.min(firstIndex, secondIndex),
    Math.max(firstIndex, secondIndex) + 1,
  );
};
