import {
  type ApplicationInstallFunctionsManifest,
  countApplicationInstallFunctions,
} from 'src/engine/core-modules/application/application-install/utils/count-application-install-functions.util';
import { type LogicFunctionAvailableManagementBudget } from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-driver.interface';

export const countInstallsFittingBudget = ({
  manifest,
  isVersionUpgrade,
  workspaceCount,
  availableBudget,
}: {
  manifest: ApplicationInstallFunctionsManifest | null;
  isVersionUpgrade: boolean;
  workspaceCount: number;
  availableBudget: LogicFunctionAvailableManagementBudget;
}): { installCount: number; functionCount: number } => {
  const functionCountPerInstall = Math.min(
    countApplicationInstallFunctions({ manifest, isVersionUpgrade }),
    availableBudget.maxFunctionCount,
  );

  if (functionCountPerInstall === 0) {
    return { installCount: workspaceCount, functionCount: 0 };
  }

  const installCount = Math.min(
    workspaceCount,
    Math.floor(
      availableBudget.availableFunctionCount / functionCountPerInstall,
    ),
  );

  return {
    installCount,
    functionCount: installCount * functionCountPerInstall,
  };
};
