import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('StopImpersonation')
export class StopImpersonationDTO {
  // True when a fresh session cookie for the impersonator was set on this
  // response, so the client can simply reload. False for cross-workspace
  // impersonation tabs, which close themselves instead.
  @Field(() => Boolean)
  canRestoreImpersonatorSession: boolean;
}
