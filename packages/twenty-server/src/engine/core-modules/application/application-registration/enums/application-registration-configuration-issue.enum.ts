import { registerEnumType } from '@nestjs/graphql';

export enum ApplicationRegistrationConfigurationIssue {
  MISSING_REQUIRED_SERVER_VARIABLES = 'MISSING_REQUIRED_SERVER_VARIABLES',
  MISSING_OWNER_WORKSPACE = 'MISSING_OWNER_WORKSPACE',
  NOT_INSTALLED_ON_OWNER_WORKSPACE = 'NOT_INSTALLED_ON_OWNER_WORKSPACE',
}

registerEnumType(ApplicationRegistrationConfigurationIssue, {
  name: 'ApplicationRegistrationConfigurationIssue',
});
