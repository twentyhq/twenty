import { EnvironmentVariablesGroup } from 'src/engine/core-modules/environment/enums/environment-variables-group.enum';

export const ENVIRONMENT_VARIABLES_GROUP_POSITION: Record<
  EnvironmentVariablesGroup,
  number
> = {
  [EnvironmentVariablesGroup.ServerConfig]: 100,
  [EnvironmentVariablesGroup.Database]: 200,
  [EnvironmentVariablesGroup.Security]: 300,
  [EnvironmentVariablesGroup.Authentication]: 400,
  [EnvironmentVariablesGroup.Cache]: 500,
  [EnvironmentVariablesGroup.QueueConfig]: 600,
  [EnvironmentVariablesGroup.Storage]: 700,
  [EnvironmentVariablesGroup.Email]: 800,
  [EnvironmentVariablesGroup.Frontend]: 900,
  [EnvironmentVariablesGroup.Workspace]: 1000,
  [EnvironmentVariablesGroup.Analytics]: 1100,
  [EnvironmentVariablesGroup.Logging]: 1200,
  [EnvironmentVariablesGroup.Billing]: 1300,
  [EnvironmentVariablesGroup.Support]: 1400,
  [EnvironmentVariablesGroup.LLM]: 1500,
  [EnvironmentVariablesGroup.Serverless]: 1600,
};
