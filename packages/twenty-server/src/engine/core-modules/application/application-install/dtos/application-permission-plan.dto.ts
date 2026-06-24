import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('ApplicationPermissionPlan')
export class ApplicationPermissionPlanDTO {
  @Field(() => [String])
  requestedPermissions: string[];
}
