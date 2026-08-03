import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('StopImpersonation')
export class StopImpersonationDTO {
  // Set when the impersonator's session cookie was restored on this response,
  // so the client can reload. Cross-workspace tabs close themselves instead.
  @Field(() => Boolean)
  canRestoreImpersonatorSession: boolean;
}
