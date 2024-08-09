import { Field, ObjectType } from '@nestjs/graphql';

import { IsOptional } from 'class-validator';

@ObjectType('ChartResult')
export class ChartResult {
  @Field(() => String, { nullable: true })
  @IsOptional()
  chartResult?: string;
}
