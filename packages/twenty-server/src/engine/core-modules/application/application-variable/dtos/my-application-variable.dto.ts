import { Field, ObjectType } from '@nestjs/graphql';

import { IsString } from 'class-validator';

@ObjectType('MyApplicationVariable')
export class MyApplicationVariableDTO {
  @IsString()
  @Field()
  key: string;

  @IsString()
  @Field()
  value: string;
}
