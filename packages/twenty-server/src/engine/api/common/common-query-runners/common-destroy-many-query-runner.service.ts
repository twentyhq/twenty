import { Injectable } from '@nestjs/common';

import { CommonFilteredMutationManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-filtered-mutation-many-query-runner.service';
import { CommonQueryNames } from 'src/engine/api/common/types/common-query-args.type';

@Injectable()
export class CommonDestroyManyQueryRunnerService extends CommonFilteredMutationManyQueryRunnerService {
  protected readonly operationName = CommonQueryNames.DESTROY_MANY;
  protected readonly mutationKind = 'delete';
}
