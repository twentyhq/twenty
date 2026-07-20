import { type ObjectRecord } from 'twenty-shared/types';

import { CommonBaseQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-base-query-runner.service';
import { type CommonBaseQueryRunnerContext } from 'src/engine/api/common/types/common-base-query-runner-context.type';
import { type CommonExtendedQueryRunnerContext } from 'src/engine/api/common/types/common-extended-query-runner-context.type';
import {
  type CommonExtendedInput,
  type CommonInput,
  CommonQueryNames,
  type FindManyQueryArgs,
} from 'src/engine/api/common/types/common-query-args.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const validationReachedError = new Error('validation reached');

class TestQueryRunner extends CommonBaseQueryRunnerService<
  FindManyQueryArgs,
  ObjectRecord[]
> {
  protected readonly operationName = CommonQueryNames.FIND_MANY;

  protected run(
    _args: CommonExtendedInput<FindManyQueryArgs>,
    _queryRunnerContext: CommonExtendedQueryRunnerContext,
  ): Promise<ObjectRecord[]> {
    return Promise.resolve([]);
  }

  protected validate(
    _args: CommonInput<FindManyQueryArgs>,
    _queryRunnerContext: CommonBaseQueryRunnerContext,
  ): Promise<void> {
    return Promise.reject(validationReachedError);
  }

  protected computeArgs(
    args: CommonInput<FindManyQueryArgs>,
    _queryRunnerContext: CommonBaseQueryRunnerContext,
  ): Promise<CommonInput<FindManyQueryArgs>> {
    return Promise.resolve(args);
  }

  protected processQueryResult(
    queryResult: ObjectRecord[],
    _flatObjectMetadata: FlatObjectMetadata,
    _flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>,
    _flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
  ): Promise<ObjectRecord[]> {
    return Promise.resolve(queryResult);
  }
}

describe('CommonBaseQueryRunnerService', () => {
  it('does not throttle API-key queries', async () => {
    const tokenBucketThrottleOrThrow = jest.fn().mockResolvedValue(99);
    const queryRunner = new TestQueryRunner();

    Object.assign(queryRunner, {
      throttlerService: { tokenBucketThrottleOrThrow },
    });

    const queryRunnerContext = {
      authContext: {
        type: 'apiKey',
        workspace: { id: 'workspace-id' },
        apiKey: { id: 'api-key-id' },
      },
    } as unknown as CommonBaseQueryRunnerContext;

    await expect(
      queryRunner.execute(
        { selectedFields: {} } as CommonInput<FindManyQueryArgs>,
        queryRunnerContext,
      ),
    ).rejects.toBe(validationReachedError);

    expect(tokenBucketThrottleOrThrow).not.toHaveBeenCalled();
  });
});
