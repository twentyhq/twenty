import { ArgsType, Field, GraphQLISODateTime } from '@nestjs/graphql';

import { IsDate, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';

@ArgsType()
export class SetMaintenanceModeInput {
  @Field(() => GraphQLISODateTime)
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  startAt: Date;

  @Field(() => GraphQLISODateTime)
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  endAt: Date;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUrl({ require_tld: false, require_protocol: true })
  link?: string;
}
