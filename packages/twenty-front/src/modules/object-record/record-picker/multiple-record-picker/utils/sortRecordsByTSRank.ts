import { type SearchRecord } from '~/generated-metadata/graphql';

export const sortRecordsByTSRank = (
  records: SearchRecord[],
): SearchRecord[] => {
  return records.sort((a, b) => {
    if (b.tsRank !== a.tsRank) {
      return b.tsRank - a.tsRank;
    }
    return b.tsRankCD - a.tsRankCD;
  });
};
