import { InputType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';
import { IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class DeleteViewFieldGroupInput {
  @IDField(() => UUIDScalarType, {
    description: 'The id of the view field group to delete.',
  })
  @IsUUID()
  id: string;
}
