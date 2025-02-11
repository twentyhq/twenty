import { EnvironmentVariablesGroup } from 'src/engine/core-modules/environment/enums/environment-variables-group.enum';

export const ENVIRONMENT_VARIABLES_GROUP_METADATA: Record<
  EnvironmentVariablesGroup,
  { position: number; description: string }
> = {
  [EnvironmentVariablesGroup.ServerConfig]: {
    position: 100,
    description: '',
  },
  [EnvironmentVariablesGroup.Authentication]: {
    position: 400,
    description: '',
  },
  [EnvironmentVariablesGroup.Email]: {
    position: 800,
    description: '',
  },
  [EnvironmentVariablesGroup.Workspace]: {
    position: 1000,
    description: '',
  },
  [EnvironmentVariablesGroup.Logging]: {
    position: 1200,
    description: '',
  },
  [EnvironmentVariablesGroup.Other]: {
    position: 1700,
    description: '',
  },
};
