import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { EmailingDomainStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-status.type';
import { VerificationRecordDTO } from 'src/engine/core-modules/emailing-domain/dtos/verification-record.dto';

registerEnumType(EmailingDomainStatus, {
  name: 'EmailingDomainStatus',
});

@ObjectType('EmailingDomain')
export class EmailingDomainDTO {
  @IDField(() => UUIDScalarType)
  id: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => String)
  domain: string;

  @Field(() => EmailingDomainStatus)
  status: EmailingDomainStatus;

  @Field(() => [VerificationRecordDTO], { nullable: true })
  verificationRecords: VerificationRecordDTO[] | null;

  @Field(() => Date, { nullable: true })
  verifiedAt: Date | null;
}
