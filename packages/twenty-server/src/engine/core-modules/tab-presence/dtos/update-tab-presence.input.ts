import { Field, InputType } from '@nestjs/graphql';

import { IsEnum, IsUUID } from 'class-validator';

import { TabPresenceStatus } from 'src/engine/core-modules/tab-presence/enums/tab-presence-status.enum';

@InputType()
export class UpdateTabPresenceInput {
  @Field(() => String)
  @IsUUID()
  tabId: string;

  @Field(() => TabPresenceStatus)
  @IsEnum(TabPresenceStatus)
  status: TabPresenceStatus;
}
