import { Field, InputType } from '@nestjs/graphql';

import { IsOptional, IsString } from 'class-validator';

@InputType()
export class UpdateMyDefaultFromHandleInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  defaultFromHandle?: string | null;
}
