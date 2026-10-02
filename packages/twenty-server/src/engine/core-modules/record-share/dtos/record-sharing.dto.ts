import {
  Field,
  ID,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';

import {
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { RecordSharingMode } from 'src/engine/core-modules/record-share/enums/record-sharing-mode.enum';
import { RecordPermissionsDTO } from 'src/engine/metadata-modules/record-permissions/dtos/record-permissions.dto';

registerEnumType(RecordShareAccessLevel, { name: 'RecordShareAccessLevel' });
registerEnumType(RecordSharePrincipalType, {
  name: 'RecordSharePrincipalType',
});
registerEnumType(RecordShareRowCause, { name: 'RecordShareRowCause' });

@InputType()
export class RecordSharePrincipalInput {
  @Field(() => UUIDScalarType, { nullable: true })
  workspaceMemberId?: string;

  @Field(() => UUIDScalarType, { nullable: true })
  roleId?: string;
}

@ObjectType()
export class RecordSharingGrantDTO {
  @Field(() => ID)
  id: string;

  @Field(() => RecordSharePrincipalType)
  principalType: RecordSharePrincipalType;

  @Field(() => UUIDScalarType)
  principalId: string;

  // The role of a member grant, to tell what that grant adds to the role
  @Field(() => UUIDScalarType, { nullable: true })
  principalRoleId: string | null;

  @Field(() => RecordShareAccessLevel)
  accessLevel: RecordShareAccessLevel;

  @Field(() => RecordShareRowCause)
  rowCause: RecordShareRowCause;
}

@ObjectType()
export class RecordSharingRoleDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => String)
  label: string;

  @Field(() => Boolean)
  canRead: boolean;

  @Field(() => Boolean)
  canUpdate: boolean;
}

@ObjectType()
export class RecordSharingDTO {
  @Field(() => RecordSharingMode)
  sharingMode: RecordSharingMode;

  @Field(() => Boolean)
  canManageSharing: boolean;

  @Field(() => RecordShareAccessLevel, { nullable: true })
  viewerAccessLevel: RecordShareAccessLevel | null;

  @Field(() => RecordPermissionsDTO)
  permissions: RecordPermissionsDTO;

  // Null when records of the object are not shared, or when the viewer can
  // no longer read the record
  @Field(() => RecordShareAccessLevel, { nullable: true })
  generalAccessLevel: RecordShareAccessLevel | null;

  @Field(() => RecordShareAccessLevel, { nullable: true })
  defaultGeneralAccessLevel: RecordShareAccessLevel | null;

  @Field(() => Boolean)
  hasManagedGeneralAccess: boolean;

  @Field(() => [RecordSharingRoleDTO])
  roles: RecordSharingRoleDTO[];

  @Field(() => [RecordSharingGrantDTO])
  shares: RecordSharingGrantDTO[];
}
