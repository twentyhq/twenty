import { Field, InputType } from '@nestjs/graphql';

import graphqlTypeJson from 'graphql-type-json';

import type { Sources } from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class UpdateCodeStepSourceInput {
  @Field(() => UUIDScalarType, {
    description: 'The id of the logic function (code step).',
  })
  id!: string;

  @Field(() => graphqlTypeJson, {
    description:
      'The source code (Sources) to write. Only updates source files.',
  })
  code!: Sources;
}
