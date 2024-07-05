import { Field, ObjectType } from '@nestjs/graphql';

import { IsOptional } from 'class-validator';

@ObjectType('AISQLQueryResult')
export class AISQLQueryResult {
  @Field(() => String)
  sqlQuery: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  sqlQueryResult?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  queryFailedErrorMessage?: string;
}
