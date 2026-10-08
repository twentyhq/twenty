import { Field, Float, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('AppPreferencesSettingsMenuItem')
export class AppPreferencesSettingsMenuItemDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => UUIDScalarType)
  universalIdentifier: string;

  @Field()
  title: string;

  @Field(() => String, { nullable: true })
  icon: string | null;

  @Field(() => Float)
  position: number;

  @Field(() => UUIDScalarType)
  frontComponentId: string;
}
