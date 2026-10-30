import { registerEnumType } from '@nestjs/graphql';

export enum GettingStartedStepActionKey {
  CONNECT_MAILBOX = 'CONNECT_MAILBOX',
  IMPORT_DATA = 'IMPORT_DATA',
  CUSTOMIZE_DATA_MODEL = 'CUSTOMIZE_DATA_MODEL',
  INSTALL_APP = 'INSTALL_APP',
  INVITE_TEAM = 'INVITE_TEAM',
  HANDOVER_DEALS = 'HANDOVER_DEALS',
  FOLLOW_UP_DEALS = 'FOLLOW_UP_DEALS',
}

registerEnumType(GettingStartedStepActionKey, {
  name: 'GettingStartedStepActionKey',
});
