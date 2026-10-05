import {
  buildRowsEstimationContextMock,
  personPositionIndex,
} from 'src/engine/api/common/common-query-runners/utils/__mocks__/build-rows-estimation-context.mock';
import { estimateCreatedRecordsRowsUsage } from 'src/engine/api/common/common-query-runners/utils/estimate-created-records-rows-usage.util';

describe('estimateCreatedRecordsRowsUsage', () => {
  it('should read the whole table to place records when the position has no index', () => {
    expect(
      estimateCreatedRecordsRowsUsage({
        createdRecordCount: 10,
        isUpsert: false,
        select: { id: true },
        context: buildRowsEstimationContextMock({
          objectNameSingular: 'person',
        }),
      }),
    ).toEqual({ rowsRead: 300_000, rowsWritten: 10 });
  });

  it('should read one row to place records when the position has an index', () => {
    expect(
      estimateCreatedRecordsRowsUsage({
        createdRecordCount: 10,
        isUpsert: false,
        select: { id: true },
        context: buildRowsEstimationContextMock({
          objectNameSingular: 'person',
          additionalPersonIndexes: [personPositionIndex],
        }),
      }),
    ).toEqual({ rowsRead: 1, rowsWritten: 10 });
  });

  it('should look up each unique column of each record on upsert', () => {
    expect(
      estimateCreatedRecordsRowsUsage({
        createdRecordCount: 10,
        isUpsert: true,
        select: { id: true },
        context: buildRowsEstimationContextMock({
          objectNameSingular: 'person',
        }),
      }),
    ).toEqual({ rowsRead: 20, rowsWritten: 10 });
  });

  it('should read nothing to place records of an object without position', () => {
    expect(
      estimateCreatedRecordsRowsUsage({
        createdRecordCount: 1,
        isUpsert: false,
        select: { id: true },
        context: buildRowsEstimationContextMock({
          objectNameSingular: 'company',
        }),
      }),
    ).toEqual({ rowsRead: 0, rowsWritten: 1 });
  });
});
