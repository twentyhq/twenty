import { registerEnumType } from '@nestjs/graphql';

export enum AdminChatThreadSortField {
  MESSAGE_COUNT = 'MESSAGE_COUNT',
  REPLY_COUNT = 'REPLY_COUNT',
  CREATED_AT = 'CREATED_AT',
  UPDATED_AT = 'UPDATED_AT',
}

registerEnumType(AdminChatThreadSortField, {
  name: 'AdminChatThreadSortField',
  description: 'Field to sort admin chat threads by',
});
