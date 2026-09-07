import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { EmailingDomainStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-status.type';
import { EmailingDomainTenantStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-tenant-status.type';
import { UnsubscribeHostnameStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/unsubscribe-hostname-status.type';
import { VerificationRecordDTO } from 'src/engine/core-modules/emailing-domain/dtos/verification-record.dto';

registerEnumType(EmailingDomainStatus, {
  name: 'EmailingDomainStatus',
});

registerEnumType(EmailingDomainTenantStatus, {
  name: 'EmailingDomainTenantStatus',
});

registerEnumType(UnsubscribeHostnameStatus, {
  name: 'UnsubscribeHostnameStatus',
});

@ObjectType('EmailingDomain')
export class EmailingDomainDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => String)
  domain: string;

  @Field(() => EmailingDomainStatus)
  status: EmailingDomainStatus;

  @Field(() => EmailingDomainTenantStatus)
  tenantStatus: EmailingDomainTenantStatus;

  @Field(() => UnsubscribeHostnameStatus, { nullable: true })
  unsubscribeHostnameStatus: UnsubscribeHostnameStatus | null;

  @Field(() => [VerificationRecordDTO], { nullable: true })
  verificationRecords: VerificationRecordDTO[] | null;

  @Field(() => Date, { nullable: true })
  verifiedAt: Date | null;
}
