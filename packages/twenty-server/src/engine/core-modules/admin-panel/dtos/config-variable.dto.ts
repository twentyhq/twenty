import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ConfigVariable {
  @Field()
  name: string;

  @Field()
  description: string;

  @Field()
  value: string;

  @Field()
  sensitive: boolean;
}
