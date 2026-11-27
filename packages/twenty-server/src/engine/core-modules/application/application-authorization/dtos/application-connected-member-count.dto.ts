import { Field, Int, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('ApplicationConnectedMemberCount')
export class ApplicationConnectedMemberCountDTO {
  @Field(() => UUIDScalarType)
  applicationId: string;

  @Field(() => Int)
  connectedMemberCount: number;
}
