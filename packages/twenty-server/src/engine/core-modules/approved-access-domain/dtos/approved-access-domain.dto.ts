import { Field, ObjectType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('ApprovedAccessDomain')
export class ApprovedAccessDomainDTO {
  @IDField(() => UUIDScalarType)
  id: string;

  @Field({ nullable: false })
  domain: string;

  @Field({ nullable: false })
  isValidated: boolean;

  @Field()
  createdAt: Date;
}
