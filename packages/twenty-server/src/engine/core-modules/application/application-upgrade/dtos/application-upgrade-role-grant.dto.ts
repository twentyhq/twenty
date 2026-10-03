import { Field, ObjectType } from '@nestjs/graphql';

import { ApplicationUpgradeRoleGrantType } from 'src/engine/core-modules/application/application-upgrade/enums/application-upgrade-role-grant-type.enum';

@ObjectType('ApplicationUpgradeRoleGrant')
export class ApplicationUpgradeRoleGrantDTO {
  @Field(() => ApplicationUpgradeRoleGrantType)
  type: ApplicationUpgradeRoleGrantType;

  @Field(() => String, { nullable: true })
  action: string | null;

  @Field(() => String, { nullable: true })
  objectUniversalIdentifier: string | null;

  @Field(() => String, { nullable: true })
  fieldUniversalIdentifier: string | null;

  @Field(() => String, { nullable: true })
  permissionFlagUniversalIdentifier: string | null;
}
