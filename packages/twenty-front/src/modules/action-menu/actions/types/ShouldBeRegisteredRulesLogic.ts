import { type AdditionalOperation, type RulesLogic } from 'json-logic-js';

type JsonLogicCustomOperations = {
  isDefined?: [RulesLogic<JsonLogicCustomOperations>];
  isNonEmptyString?: [RulesLogic<JsonLogicCustomOperations>];
  hasReadPermission?: [string];
  hasWritePermission?: [string];
  isFeatureFlagEnabled?: [string];
  areWorkflowTriggerAndStepsDefined?: [];
} & AdditionalOperation;

export type ShouldBeRegisteredRulesLogic =
  RulesLogic<JsonLogicCustomOperations>;
