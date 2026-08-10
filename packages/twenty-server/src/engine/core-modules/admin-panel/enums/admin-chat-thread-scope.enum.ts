import { registerEnumType } from '@nestjs/graphql';

export enum AdminChatThreadScope {
  ONBOARDING = 'ONBOARDING',
  ALL = 'ALL',
}

registerEnumType(AdminChatThreadScope, {
  name: 'AdminChatThreadScope',
  description: 'Scope of chat threads to list in the admin panel',
});
