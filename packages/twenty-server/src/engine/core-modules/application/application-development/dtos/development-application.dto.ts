import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('DevelopmentApplication')
export class DevelopmentApplicationDTO {
  @Field(() => String)
  id: string;

  @Field(() => String)
  universalIdentifier: string;
}
