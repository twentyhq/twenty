import { type ObjectsPermissions } from 'twenty-shared/types';

import { type CommonBaseQueryRunnerContext } from 'src/engine/api/common/types/common-base-query-runner-context.type';

export type CommonArgsProcessorQueryRunnerContext =
  CommonBaseQueryRunnerContext & {
    objectsPermissions: ObjectsPermissions;
  };
