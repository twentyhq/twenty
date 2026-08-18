import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('OnboardingSlackAuthorization')
export class OnboardingSlackAuthorizationDTO {
  @Field(() => String, {
    description: 'Slack authorization URL the browser must be redirected to',
  })
  authorizationUrl: string;
}
