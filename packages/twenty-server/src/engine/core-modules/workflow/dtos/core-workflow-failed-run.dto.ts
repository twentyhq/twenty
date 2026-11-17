import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('CoreWorkflowFailedRun')
export class CoreWorkflowFailedRunDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => String, { nullable: true })
  name: string | null;

  @Field(() => String)
  createdAt: string;

  @Field(() => String, { nullable: true })
  errorMessage: string | null;
}
