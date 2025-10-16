import { Field, ObjectType } from '@nestjs/graphql';

import { IsBoolean, IsString } from 'class-validator';

@ObjectType('ApplicationVariable')
export class ApplicationVariableDTO {
  @IsString()
  @Field()
  key: string;

  @IsString()
  @Field()
  value: string;

  @IsString()
  @Field()
  description: string;

  @IsBoolean()
  @Field()
  isSecret: boolean;
}
