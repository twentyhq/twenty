import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class RotateClientSecretOutput {
  @Field()
  clientSecret: string;
}
