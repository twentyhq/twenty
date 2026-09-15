import { registerEnumType } from '@nestjs/graphql';

export enum AdminChatThreadSortDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

registerEnumType(AdminChatThreadSortDirection, {
  name: 'AdminChatThreadSortDirection',
  description: 'Direction to sort admin chat threads',
});
