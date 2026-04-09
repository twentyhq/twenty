import { Field, ObjectType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('MinimalObjectMetadata')
export class MinimalObjectMetadataDTO {
  @IDField(() => UUIDScalarType)
  id: string;

  @Field()
  nameSingular: string;

  @Field()
  namePlural: string;

  @Field()
  labelSingular: string;

  @Field()
  labelPlural: string;

  @Field({ nullable: true })
  icon?: string;

  @Field({ nullable: true })
  color?: string;

  @Field()
  isCustom: boolean;

  @Field()
  isActive: boolean;

  @Field()
  isSystem: boolean;

  @Field()
  isRemote: boolean;
}
