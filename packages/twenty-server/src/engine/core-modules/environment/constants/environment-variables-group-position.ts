import { EnvironmentVariablesGroup } from 'src/engine/core-modules/environment/enums/environment-variables-group.enum';

export const ENVIRONMENT_VARIABLES_GROUP_METADATA: Record<
  EnvironmentVariablesGroup,
  { position: number; description: string }
> = {
  [EnvironmentVariablesGroup.ServerConfig]: {
    position: 100,
    description: '',
  },
  [EnvironmentVariablesGroup.Database]: {
    position: 200,
    description: '',
  },
  [EnvironmentVariablesGroup.Authentication]: {
    position: 400,
    description: '',
  },
  [EnvironmentVariablesGroup.Cache]: {
    position: 500,
    description: '',
  },
  [EnvironmentVariablesGroup.QueueConfig]: {
    position: 600,
    description: '',
  },
  [EnvironmentVariablesGroup.Storage]: {
    position: 700,
    description: '',
  },
  [EnvironmentVariablesGroup.Email]: {
    position: 800,
    description: '',
  },
  [EnvironmentVariablesGroup.Frontend]: {
    position: 900,
    description: '',
  },
  [EnvironmentVariablesGroup.Workspace]: {
    position: 1000,
    description: '',
  },
  [EnvironmentVariablesGroup.Analytics]: {
    position: 1100,
    description: '',
  },
  [EnvironmentVariablesGroup.Logging]: {
    position: 1200,
    description: '',
  },
  [EnvironmentVariablesGroup.Billing]: {
    position: 1300,
    description: '',
  },
  [EnvironmentVariablesGroup.Support]: {
    position: 1400,
    description: '',
  },
  [EnvironmentVariablesGroup.Other]: {
    position: 1700,
    description: '',
  },
};
