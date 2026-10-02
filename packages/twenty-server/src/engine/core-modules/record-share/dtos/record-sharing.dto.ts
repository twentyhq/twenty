import { Field, ID, InputType, ObjectType } from '@nestjs/graphql';
import {
  ObjectSharingReach,
  RecordShareAccessLevel,
} from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { RecordPermissionsDTO } from 'src/engine/core-modules/record-share/dtos/record-permissions.dto';

@InputType()
export class RecordSharingTargetInput {
  @Field(() => UUIDScalarType)
  objectMetadataId: string;

  @Field(() => UUIDScalarType)
  recordId: string;
}

@InputType()
export class RecordSharePrincipalInput {
  @Field(() => UUIDScalarType, { nullable: true })
  workspaceMemberId?: string;

  @Field(() => UUIDScalarType, { nullable: true })
  roleId?: string;

  @Field(() => Boolean, { nullable: true })
  everyone?: boolean;
}

@ObjectType()
export class RecordSharingGrantDTO {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  principalType: string;

  @Field(() => UUIDScalarType)
  principalId: string;

  @Field(() => RecordShareAccessLevel)
  accessLevel: RecordShareAccessLevel;

  @Field(() => String)
  rowCause: string;

  // What the role of the principal grants on the object without this share;
  // null for everyone, who holds the access of each member's own role
  @Field(() => Boolean, { nullable: true })
  canRoleRead: boolean | null;

  @Field(() => Boolean, { nullable: true })
  canRoleUpdate: boolean | null;
}

@ObjectType()
export class RecordSharingRoleDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => String)
  label: string;
}

@ObjectType()
export class RecordSharingDTO {
  @Field(() => RecordShareAccessLevel, { nullable: true })
  viewerAccessLevel: RecordShareAccessLevel | null;

  @Field(() => RecordPermissionsDTO)
  permissions: RecordPermissionsDTO;

  @Field(() => Boolean)
  isEnabled: boolean;

  @Field(() => Boolean)
  hasInheritedAccess: boolean;

  @Field(() => Boolean)
  isOpenByDefault: boolean;

  @Field(() => RecordShareAccessLevel, { nullable: true })
  generalAccessLevel: RecordShareAccessLevel | null;

  @Field(() => Boolean)
  isGeneralAccessDefault: boolean;

  @Field(() => ObjectSharingReach)
  sharingReach: ObjectSharingReach;

  @Field(() => [RecordSharingRoleDTO])
  roles: RecordSharingRoleDTO[];

  @Field(() => [RecordSharingGrantDTO])
  shares: RecordSharingGrantDTO[];
}
