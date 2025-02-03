import { EnvironmentVariablesGroup } from 'src/engine/core-modules/environment/enums/environment-variables-group.enum';

export const ENVIRONMENT_VARIABLES_HIDDEN_GROUPS: Set<EnvironmentVariablesGroup> =
  new Set([EnvironmentVariablesGroup.LLM]);
