import { Field, ObjectType } from '@nestjs/graphql';

import { RecordShareAccessLevel } from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('ApplicationGrantPermission')
export class ApplicationGrantPermissionDTO {
  @Field()
  type: string;

  @Field()
  label: string;

  @Field(() => String, { nullable: true })
  action?: string | null;

  @Field(() => UUIDScalarType, { nullable: true })
  objectMetadataId?: string | null;

  @Field(() => String, { nullable: true })
  permissionFlagUniversalIdentifier?: string | null;
}

@ObjectType('ApplicationGrantLockedObjectPermission')
export class ApplicationGrantLockedObjectPermissionDTO {
  @Field(() => UUIDScalarType)
  objectMetadataId: string;

  @Field()
  canReadObjectRecords: boolean;

  @Field()
  canUpdateObjectRecords: boolean;

  @Field()
  canSoftDeleteObjectRecords: boolean;

  @Field()
  canDestroyObjectRecords: boolean;
}

@ObjectType('ApplicationGrantObject')
export class ApplicationGrantObjectDTO {
  @Field(() => UUIDScalarType)
  objectMetadataId: string;

  @Field(() => RecordShareAccessLevel)
  accessLevel: RecordShareAccessLevel;
}

@ObjectType('ApplicationGrantObjectAccess')
export class ApplicationGrantObjectAccessDTO {
  @Field()
  coversAllObjects: boolean;

  @Field(() => [ApplicationGrantObjectDTO])
  objects: ApplicationGrantObjectDTO[];
}

@ObjectType('ApplicationGrant')
export class ApplicationGrantDTO {
  @Field(() => UUIDScalarType)
  applicationId: string;

  @Field(() => UUIDScalarType, { nullable: true })
  grantRoleId: string | null;

  @Field(() => UUIDScalarType, { nullable: true })
  requestedRoleId: string | null;

  @Field(() => String, { nullable: true })
  applicationVersion: string | null;

  @Field(() => [String])
  requestedAllObjectsActions: string[];

  @Field(() => [ApplicationGrantLockedObjectPermissionDTO])
  lockedObjectPermissions: ApplicationGrantLockedObjectPermissionDTO[];

  @Field(() => [ApplicationGrantPermissionDTO])
  pendingPermissions: ApplicationGrantPermissionDTO[];

  @Field(() => ApplicationGrantObjectAccessDTO, { nullable: true })
  objectAccess: ApplicationGrantObjectAccessDTO | null;
}
