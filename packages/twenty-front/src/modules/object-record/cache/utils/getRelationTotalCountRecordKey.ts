// A record holds a relation as a plain list, so the total count of its connection lives under a sibling key
export const getRelationTotalCountRecordKey = (relationRecordKey: string) =>
  `${relationRecordKey}TotalCount`;
