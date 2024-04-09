import { Field, ObjectType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

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

  @Field({ nullable: false })
  colorScheme: string;

  @Field({ nullable: true })
  avatarUrl: string;

  @Field({ nullable: false })
  locale: string;
}
