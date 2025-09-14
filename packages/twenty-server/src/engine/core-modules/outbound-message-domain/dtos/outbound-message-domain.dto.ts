import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import OutboundMessageDomainStatus, {
  OutboundMessageDomainDriver,
  OutboundMessageDomainSyncStatus,
} from 'src/engine/core-modules/outbound-message-domain/drivers/types/outbound-message-domain';

registerEnumType(OutboundMessageDomainDriver, {
  name: 'OutboundMessageDomainDriver',
});

registerEnumType(OutboundMessageDomainStatus, {
  name: 'OutboundMessageDomainStatus',
});

registerEnumType(OutboundMessageDomainSyncStatus, {
  name: 'OutboundMessageDomainSyncStatus',
});

@ObjectType('OutboundMessageDomain')
export class OutboundMessageDomainDto {
  @IDField(() => UUIDScalarType)
  id: string;

  @Field({ nullable: false })
  domain: string;

  @Field(() => OutboundMessageDomainDriver, { nullable: false })
  driver: OutboundMessageDomainDriver;

  @Field(() => OutboundMessageDomainStatus, { nullable: false })
  status: OutboundMessageDomainStatus;

  @Field(() => OutboundMessageDomainSyncStatus, { nullable: false })
  syncStatus: OutboundMessageDomainSyncStatus;

  @Field({ nullable: true })
  verifiedAt?: Date | null;

  @Field({ nullable: true })
  lastSyncedAt?: Date | null;

  @Field({ nullable: true })
  syncError?: string | null;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
