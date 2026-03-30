import { ArgsType, Field } from '@nestjs/graphql';

import { IsISO8601, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

@ArgsType()
export class SetMaintenanceModeInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsISO8601()
  startAt: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsISO8601()
  endAt: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUrl({ require_tld: false, require_protocol: true })
  link?: string;
}
