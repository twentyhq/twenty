import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('AppPreferencesApplication')
export class AppPreferencesApplicationDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => UUIDScalarType)
  universalIdentifier: string;

  @Field()
  name: string;

  @Field()
  hasConnectionProviders: boolean;

  @Field(() => String, { nullable: true })
  logoUrl: string | null;
}
