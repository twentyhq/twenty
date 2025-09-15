import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import {
  OutboundMessageDomainDriver,
  OutboundMessageDomainStatus,
} from 'src/engine/core-modules/outbound-message-domain/drivers/types/outbound-message-domain';
import { VerificationRecord } from 'src/engine/core-modules/outbound-message-domain/dtos/verification-record.dto';

registerEnumType(OutboundMessageDomainDriver, {
  name: 'OutboundMessageDomainDriver',
});

registerEnumType(OutboundMessageDomainStatus, {
  name: 'OutboundMessageDomainStatus',
});

@ObjectType('OutboundMessageDomain')
export class OutboundMessageDomainDto {
  @IDField(() => UUIDScalarType)
  id: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => String)
  domain: string;

  @Field(() => OutboundMessageDomainDriver)
  driver: OutboundMessageDomainDriver;

  @Field(() => OutboundMessageDomainStatus)
  status: OutboundMessageDomainStatus;

  @Field(() => [VerificationRecord], { nullable: true })
  verificationRecords: VerificationRecord[] | null;

  @Field(() => Date, { nullable: true })
  verifiedAt: Date | null;
}
