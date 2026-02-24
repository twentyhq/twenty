import jsonLogic from 'json-logic-js';

import { type ShouldBeRegisteredFunctionParams } from '@/action-menu/actions/types/ShouldBeRegisteredFunctionParams';

let registered = false;

export const registerShouldBeRegisteredOperators = () => {
  if (registered) {
    return;
  }

  registered = true;

  jsonLogic.add_operation('isDefined', (value: unknown) => {
    return value !== null && value !== undefined;
  });

  jsonLogic.add_operation('isNonEmptyString', (value: unknown) => {
    return typeof value === 'string' && value.length > 0;
  });

  jsonLogic.add_operation(
    'hasReadPermission',
    function (this: ShouldBeRegisteredFunctionParams, objectName: string) {
      return this.getTargetObjectReadPermission(objectName);
    },
  );

  jsonLogic.add_operation(
    'hasWritePermission',
    function (this: ShouldBeRegisteredFunctionParams, objectName: string) {
      return this.getTargetObjectWritePermission(objectName);
    },
  );

  jsonLogic.add_operation(
    'isFeatureFlagEnabled',
    function (this: ShouldBeRegisteredFunctionParams, flagKey: string) {
      return this.isFeatureFlagEnabled(
        flagKey as Parameters<typeof this.isFeatureFlagEnabled>[0],
      );
    },
  );

  jsonLogic.add_operation(
    'areWorkflowTriggerAndStepsDefined',
    function (this: ShouldBeRegisteredFunctionParams) {
      const workflow = this.workflowWithCurrentVersion;

      if (!workflow?.currentVersion?.trigger) {
        return false;
      }

      if (
        !workflow.currentVersion.steps ||
        workflow.currentVersion.steps.length === 0
      ) {
        return false;
      }

      return true;
    },
  );
};
