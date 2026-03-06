import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('NpmClaimToken')
export class NpmClaimTokenDTO {
  @Field()
  token: string;
}
