import { Field, InputType } from '@nestjs/graphql';

import { IsBoolean, IsOptional } from 'class-validator';

@InputType()
export class UpdateApplicationInput {
  @IsOptional()
  @IsBoolean()
  @Field(() => Boolean, { nullable: true })
  autoUpgrade?: boolean;
}
