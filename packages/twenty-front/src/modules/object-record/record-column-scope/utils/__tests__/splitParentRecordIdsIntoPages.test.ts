import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';

import { splitParentRecordIdsIntoPages } from '@/object-record/record-column-scope/utils/splitParentRecordIdsIntoPages';

const buildRecordIds = (count: number) =>
  Array.from({ length: count }, (_, index) => `record-${index}`);

describe('splitParentRecordIdsIntoPages', () => {
  it('returns no page when no record is loaded', () => {
    expect(splitParentRecordIdsIntoPages([])).toEqual([]);
  });

  it('keeps each page within the server query cap', () => {
    const pages = splitParentRecordIdsIntoPages(
      buildRecordIds(QUERY_MAX_RECORDS * 2 + 1),
    );

    expect(pages.map((page) => page.length)).toEqual([
      QUERY_MAX_RECORDS,
      QUERY_MAX_RECORDS,
      1,
    ]);
  });

  it('leaves full pages unchanged when more records load', () => {
    const firstPage = splitParentRecordIdsIntoPages(
      buildRecordIds(QUERY_MAX_RECORDS + 10),
    )[0];

    expect(
      splitParentRecordIdsIntoPages(buildRecordIds(QUERY_MAX_RECORDS + 50))[0],
    ).toEqual(firstPage);
  });
});
