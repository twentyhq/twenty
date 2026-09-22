import { Field, ObjectType } from '@nestjs/graphql';

import { type ApplicationCapability } from 'twenty-shared/application';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('ApplicationCapabilityGrant')
export class ApplicationCapabilityGrantDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => [String])
  grantedCapabilities: ApplicationCapability[];
}
