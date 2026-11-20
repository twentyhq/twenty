import { Field, InputType } from '@nestjs/graphql';

import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class UpdateFocusedTabInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  tabId: string;

  @Field(() => Boolean)
  @IsBoolean()
  isFocused: boolean;
}
