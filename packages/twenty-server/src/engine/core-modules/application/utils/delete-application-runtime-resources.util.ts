import { isNonEmptyArray } from 'twenty-shared/utils';

import { type LogicFunctionDriver } from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-driver.interface';

export const deleteApplicationRuntimeResources = async ({
  logicFunctionDriver,
  workspaceId,
  applicationUniversalIdentifiers,
}: {
  logicFunctionDriver: Pick<LogicFunctionDriver, 'deleteApplicationResources'>;
  workspaceId: string;
  applicationUniversalIdentifiers: string[];
}): Promise<void> => {
  const failures: string[] = [];

  for (const applicationUniversalIdentifier of applicationUniversalIdentifiers) {
    try {
      await logicFunctionDriver.deleteApplicationResources({
        workspaceId,
        applicationUniversalIdentifier,
      });
    } catch (error) {
      failures.push(
        `${applicationUniversalIdentifier}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  if (isNonEmptyArray(failures)) {
    throw new Error(
      `Failed to delete runtime resources for workspace ${workspaceId}: ${failures.join('; ')}`,
    );
  }
};
