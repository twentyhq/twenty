import { isDefined } from 'twenty-shared/utils';

import { GroupByArgProcessorService } from 'src/engine/api/common/common-args-processors/group-by-arg-processor/group-by-arg-processor.service';
import { CommonGroupByQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-group-by-query-runner.service';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { CommonApiContextBuilderService } from 'src/engine/core-modules/record-crud/services/common-api-context-builder.service';
import { GroupByRecordsService } from 'src/engine/core-modules/record-crud/services/group-by-records.service';
import { type GroupByRecordsParams } from 'src/engine/core-modules/record-crud/types/group-by-records-params.type';

describe('GroupByRecordsService dimension labels', () => {
  it.each<{
    groupBy: GroupByRecordsParams['groupBy'];
    dimensionLabel: string;
  }>([
    { groupBy: [{ tags: { unnest: true } }], dimensionLabel: 'tags' },
    { groupBy: [{ tags: true }], dimensionLabel: 'tags' },
    {
      groupBy: [{ name: { firstName: true } }],
      dimensionLabel: 'name.firstName',
    },
  ])(
    'returns $dimensionLabel for $groupBy',
    async ({ groupBy, dimensionLabel }) => {
      const commonGroupByRunner = {
        execute: jest.fn().mockResolvedValue({
          results: [
            { groupByDimensionValues: ['RADIUS'], totalCount: '2' },
            { groupByDimensionValues: ['IGA_ACCESS_REVIEWS'], totalCount: '2' },
            { groupByDimensionValues: ['PAM'], totalCount: '1' },
          ],
        }),
      } as unknown as CommonGroupByQueryRunnerService;

      const commonApiContextBuilder = {
        build: jest.fn().mockResolvedValue({
          queryRunnerContext: {},
          flatObjectMetadata: { id: 'object-id' },
          flatFieldMetadataMaps: {},
          objectsPermissions: {},
        }),
      } as unknown as CommonApiContextBuilderService;

      const groupByArgProcessor = {
        getAvailableAggregations: jest.fn().mockReturnValue({}),
        resolveToolAggregateFieldKeyOrThrow: jest
          .fn()
          .mockReturnValue('totalCount'),
      } as unknown as GroupByArgProcessorService;

      const service = new GroupByRecordsService(
        commonGroupByRunner,
        commonApiContextBuilder,
        groupByArgProcessor,
      );

      const output = await service.execute({
        objectName: 'company',
        groupBy,
        authContext: {} as WorkspaceAuthContext,
      });

      expect(commonGroupByRunner.execute).toHaveBeenCalledTimes(1);
      expect(commonGroupByRunner.execute).toHaveBeenCalledWith(
        expect.objectContaining({ groupBy }),
        {},
      );
      expect(output.success).toBe(true);

      if (output.success !== true || !isDefined(output.result)) {
        throw new Error('Expected a successful group-by output');
      }

      expect(output.result.dimensionLabels).toEqual([dimensionLabel]);
      expect(output.result.groups).toEqual([
        { dimensions: ['RADIUS'], value: '2' },
        { dimensions: ['IGA_ACCESS_REVIEWS'], value: '2' },
        { dimensions: ['PAM'], value: '1' },
      ]);
    },
  );
});
