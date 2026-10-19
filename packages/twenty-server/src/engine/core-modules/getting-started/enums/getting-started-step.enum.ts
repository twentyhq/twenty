import { registerEnumType } from '@nestjs/graphql';

export enum GettingStartedStep {
  CONNECT_MAILBOX = 'CONNECT_MAILBOX',
  IMPORT_DATA = 'IMPORT_DATA',
  INSTALL_APP = 'INSTALL_APP',
  INVITE_TEAM = 'INVITE_TEAM',
  HANDOVER_DEALS = 'HANDOVER_DEALS',
  FOLLOW_UP_DEALS = 'FOLLOW_UP_DEALS',
}

registerEnumType(GettingStartedStep, { name: 'GettingStartedStep' });
