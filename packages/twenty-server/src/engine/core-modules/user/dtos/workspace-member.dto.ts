import { Field, ObjectType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { RoleDTO } from 'src/engine/metadata-modules/role/dtos/role.dto';
import {
  WorkspaceMemberDateFormatEnum,
  WorkspaceMemberTimeFormatEnum,
} from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@ObjectType()
export class FullName {
  @Field({ nullable: false })
  firstName: string;

  @Field({ nullable: false })
  lastName: string;
}

@ObjectType()
export class WorkspaceMember {
  @IDField(() => UUIDScalarType)
  id: string;

  @Field(() => FullName)
  name: FullName;

  @Field({ nullable: false })
  userEmail: string;

  @Field({ nullable: false })
  colorScheme: string;

  @Field({ nullable: true })
  avatarUrl: string;

  @Field({ nullable: true })
  locale: string;

  @Field({ nullable: true })
  timeZone: string;

  @Field(() => WorkspaceMemberDateFormatEnum, { nullable: true })
  dateFormat: WorkspaceMemberDateFormatEnum;

  @Field(() => WorkspaceMemberTimeFormatEnum, { nullable: true })
  timeFormat: WorkspaceMemberTimeFormatEnum;

  @Field(() => [RoleDTO], { nullable: true })
  roles?: RoleDTO[];

  @Field(() => String, { nullable: true })
  userWorkspaceId?: string;
}
