import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

export enum ApplicationUpgradeRoleGrantType {
  ALL_OBJECT_RECORDS = 'ALL_OBJECT_RECORDS',
  ALL_SETTINGS = 'ALL_SETTINGS',
  ALL_TOOLS = 'ALL_TOOLS',
  PERMISSION_FLAG = 'PERMISSION_FLAG',
  OBJECT_RECORDS = 'OBJECT_RECORDS',
  FIELD_VALUE = 'FIELD_VALUE',
  ROW_LEVEL_RESTRICTION = 'ROW_LEVEL_RESTRICTION',
}

registerEnumType(ApplicationUpgradeRoleGrantType, {
  name: 'ApplicationUpgradeRoleGrantType',
});

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
