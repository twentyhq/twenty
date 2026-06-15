import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('InviteSuggestion')
export class InviteSuggestionDTO {
  @Field(() => String, {
    description: 'Email address of a suggested teammate to invite',
  })
  email: string;

  @Field(() => String, {
    nullable: true,
    description: 'Display name of the suggested teammate, when known',
  })
  displayName?: string;
}
