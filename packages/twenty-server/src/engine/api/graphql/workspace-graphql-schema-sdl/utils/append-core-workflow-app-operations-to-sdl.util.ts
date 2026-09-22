import { buildCoreWorkflowAppOperationsSdl } from 'src/engine/api/graphql/workspace-graphql-schema-sdl/utils/build-core-workflow-app-operations-sdl.util';
import { mergeCoreWorkflowAppOperationsIntoSdl } from 'src/engine/api/graphql/workspace-graphql-schema-sdl/utils/merge-core-workflow-app-operations-into-sdl.util';

export const appendCoreWorkflowAppOperationsToSdl = async (
  baseSdl: string,
): Promise<string> =>
  mergeCoreWorkflowAppOperationsIntoSdl({
    baseSdl,
    operationsSdl: await buildCoreWorkflowAppOperationsSdl(),
  });
