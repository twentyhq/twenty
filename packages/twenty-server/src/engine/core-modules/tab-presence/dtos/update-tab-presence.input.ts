import { Field, InputType } from '@nestjs/graphql';

import { IsIn, IsUUID } from 'class-validator';
import {
  TAB_PRESENCE_STATE,
  type TabPresenceState,
} from 'twenty-shared/constants';

@InputType()
export class UpdateTabPresenceInput {
  @Field(() => String)
  @IsUUID()
  tabId: string;

  @Field(() => String)
  @IsIn(Object.values(TAB_PRESENCE_STATE))
  state: TabPresenceState;
}
