import { EnvironmentVariablesGroup } from 'src/engine/core-modules/environment/enums/environment-variables-group.enum';

type GroupMetadata = {
  position: number;
  description: string;
  isHiddenOnLoad: boolean;
};

export const ENVIRONMENT_VARIABLES_GROUP_METADATA: Record<
  EnvironmentVariablesGroup,
  GroupMetadata
> = {
  [EnvironmentVariablesGroup.ServerConfig]: {
    position: 100,
    description: '',
    isHiddenOnLoad: false,
  },
  [EnvironmentVariablesGroup.Authentication]: {
    position: 400,
    description: '',
    isHiddenOnLoad: false,
  },
  [EnvironmentVariablesGroup.Email]: {
    position: 800,
    description: '',
    isHiddenOnLoad: false,
  },
  [EnvironmentVariablesGroup.Workspace]: {
    position: 1000,
    description: '',
    isHiddenOnLoad: false,
  },
  [EnvironmentVariablesGroup.Logging]: {
    position: 1200,
    description: '',
    isHiddenOnLoad: false,
  },
  [EnvironmentVariablesGroup.Other]: {
    position: 1700,
    description:
      "The variables in this section are mostly used for internal purposes (running our Cloud offering), but shouldn't usually be required for a simple self-hosted instance",
    isHiddenOnLoad: true,
  },
};
