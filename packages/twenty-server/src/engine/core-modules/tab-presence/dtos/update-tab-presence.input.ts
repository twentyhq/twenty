import { Field, InputType } from '@nestjs/graphql';

import { IsIn, IsUUID } from 'class-validator';
import {
  TAB_PRESENCE_STATUS,
  type TabPresenceStatus,
} from 'twenty-shared/constants';

@InputType()
export class UpdateTabPresenceInput {
  @Field(() => String)
  @IsUUID()
  tabId: string;

  @Field(() => String)
  @IsIn(Object.values(TAB_PRESENCE_STATUS))
  status: TabPresenceStatus;
}
