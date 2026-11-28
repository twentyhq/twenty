import { Field, ObjectType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';
import { type InteractiveConnectionScreen } from 'twenty-shared/application';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { InteractiveConnectionStatus } from 'src/engine/core-modules/application/connection-provider/dtos/interactive-connection-status.enum';

@ObjectType('InteractiveConnectionStep')
export class InteractiveConnectionStepDTO {
  @Field(() => InteractiveConnectionStatus)
  status: InteractiveConnectionStatus;

  @Field(() => UUIDScalarType, { nullable: true })
  flowId: string | null;

  @Field(() => GraphQLJSON, { nullable: true })
  screen: InteractiveConnectionScreen | null;

  @Field(() => UUIDScalarType, { nullable: true })
  connectedAccountId: string | null;
}
