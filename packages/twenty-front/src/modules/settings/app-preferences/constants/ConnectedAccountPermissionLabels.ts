import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { type ConnectedAccountPermission } from 'twenty-shared/types';

export const CONNECTED_ACCOUNT_PERMISSION_LABELS: Record<
  ConnectedAccountPermission,
  MessageDescriptor
> = {
  READ_EMAILS: msg`Read emails`,
  SEND_EMAILS: msg`Send emails`,
  MANAGE_EVENTS: msg`Manage events`,
};
