import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('RotateClientSecret')
export class RotateClientSecretDTO {
  @Field()
  clientSecret: string;
}
