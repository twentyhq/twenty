import { registerEnumType } from '@nestjs/graphql';

import { type ConnectionProviderScope } from 'twenty-shared/application';

export const ConnectionProviderScopeEnum = {
  WORKSPACE: 'WORKSPACE',
  USER: 'USER',
} as const satisfies { [P in ConnectionProviderScope]: P };

registerEnumType(ConnectionProviderScopeEnum, {
  name: 'ConnectionProviderScope',
});
