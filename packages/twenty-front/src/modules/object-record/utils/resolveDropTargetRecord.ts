export const resolveDropTargetRecord = <TRecord>({
  records,
  toIndex,
}: {
  records: TRecord[];
  toIndex: number;
}): { targetRecord: TRecord | undefined; isDroppedAfterList: boolean } => {
  const isDroppedAfterList = toIndex >= records.length;

  return {
    targetRecord: isDroppedAfterList ? records.at(-1) : records[toIndex],
    isDroppedAfterList,
  };
};
