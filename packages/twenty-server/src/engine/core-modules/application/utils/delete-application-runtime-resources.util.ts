import { isNonEmptyArray } from 'twenty-shared/utils';

import { type LogicFunctionDriver } from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-driver.interface';

export const deleteApplicationRuntimeResources = async ({
  logicFunctionDriver,
  workspaceId,
  applicationUniversalIdentifiers,
  logicFunctionIds,
}: {
  logicFunctionDriver: Pick<
    LogicFunctionDriver,
    'delete' | 'deleteApplicationResources'
  >;
  workspaceId: string;
  applicationUniversalIdentifiers: string[];
  logicFunctionIds: string[];
}): Promise<void> => {
  const failures: string[] = [];

  for (const logicFunctionId of logicFunctionIds) {
    try {
      await logicFunctionDriver.delete({ id: logicFunctionId });
    } catch (error) {
      failures.push(
        `logic function ${logicFunctionId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  for (const applicationUniversalIdentifier of applicationUniversalIdentifiers) {
    try {
      await logicFunctionDriver.deleteApplicationResources({
        workspaceId,
        applicationUniversalIdentifier,
      });
    } catch (error) {
      failures.push(
        `application ${applicationUniversalIdentifier}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  if (isNonEmptyArray(failures)) {
    throw new Error(
      `Failed to delete runtime resources for workspace ${workspaceId}: ${failures.join('; ')}`,
    );
  }
};
