import { Field, ObjectType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import {
  WorkspaceMemberColorSchemeEnum,
  WorkspaceMemberDateFormatEnum,
  WorkspaceMemberTimeFormatEnum,
} from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@ObjectType('FullName')
export class FullName {
  @Field({ nullable: false })
  firstName: string;

  @Field({ nullable: false })
  lastName: string;
}

@ObjectType('WorkspaceMember')
export class WorkspaceMember {
  @IDField(() => UUIDScalarType)
  id: string;

  @Field(() => FullName)
  name: FullName;

  @Field(() => WorkspaceMemberColorSchemeEnum)
  colorScheme: WorkspaceMemberColorSchemeEnum;

  @Field({ nullable: true })
  avatarUrl: string;

  @Field({ nullable: false })
  locale: string;

  @Field({ nullable: false })
  timeZone: string;

  @Field(() => WorkspaceMemberDateFormatEnum)
  dateFormat: WorkspaceMemberDateFormatEnum;

  @Field(() => WorkspaceMemberTimeFormatEnum)
  timeFormat: WorkspaceMemberTimeFormatEnum;
}
