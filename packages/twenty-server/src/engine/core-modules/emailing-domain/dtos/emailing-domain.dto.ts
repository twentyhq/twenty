import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import {
  EmailingDomainDriver,
  EmailingDomainStatus,
} from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain';
import { VerificationRecord } from 'src/engine/core-modules/emailing-domain/dtos/verification-record.dto';

registerEnumType(EmailingDomainDriver, {
  name: 'EmailingDomainDriver',
});

registerEnumType(EmailingDomainStatus, {
  name: 'EmailingDomainStatus',
});

@ObjectType('EmailingDomain')
export class EmailingDomainDto {
  @IDField(() => UUIDScalarType)
  id: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => String)
  domain: string;

  @Field(() => EmailingDomainDriver)
  driver: EmailingDomainDriver;

  @Field(() => EmailingDomainStatus)
  status: EmailingDomainStatus;

  @Field(() => [VerificationRecord], { nullable: true })
  verificationRecords: VerificationRecord[] | null;

  @Field(() => Date, { nullable: true })
  verifiedAt: Date | null;
}
