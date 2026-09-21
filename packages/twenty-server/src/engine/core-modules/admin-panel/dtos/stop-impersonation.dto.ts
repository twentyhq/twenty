import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('StopImpersonation')
export class StopImpersonationDTO {
  @Field(() => Boolean)
  canRestoreImpersonatorSession: boolean;
}
