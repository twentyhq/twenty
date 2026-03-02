import { type AdditionalOperation, type RulesLogic } from 'json-logic-js';

type ShouldBeRegisteredCustomOperations = {
  isDefined?: [RulesLogic<ShouldBeRegisteredCustomOperations>];
  isNonEmptyString?: [RulesLogic<ShouldBeRegisteredCustomOperations>];
  hasReadPermission?: [string];
  hasWritePermission?: [string];
  isFeatureFlagEnabled?: [string];
  areWorkflowTriggerAndStepsDefined?: [];
} & AdditionalOperation;

export type ShouldBeRegisteredRulesLogic =
  RulesLogic<ShouldBeRegisteredCustomOperations>;
