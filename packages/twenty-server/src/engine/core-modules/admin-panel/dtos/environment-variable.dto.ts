import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class EnvironmentVariable {
  @Field()
  name: string;

  @Field()
  description: string;

  @Field()
  value: string;

  @Field()
  sensitive: boolean;
}
