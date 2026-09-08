import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { EmailingDomainStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-status.type';
import { EmailingDomainTenantStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-tenant-status.type';
import { ManagedHostnameStatus } from 'src/engine/core-modules/dns-manager/types/managed-hostname-status.type';
import { VerificationRecordDTO } from 'src/engine/core-modules/emailing-domain/dtos/verification-record.dto';

registerEnumType(EmailingDomainStatus, {
  name: 'EmailingDomainStatus',
});

registerEnumType(EmailingDomainTenantStatus, {
  name: 'EmailingDomainTenantStatus',
});

registerEnumType(ManagedHostnameStatus, {
  name: 'ManagedHostnameStatus',
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

  @Field(() => ManagedHostnameStatus, { nullable: true })
  unsubscribeHostnameStatus: ManagedHostnameStatus | null;

  @Field(() => Boolean)
  clickTrackingEnabled: boolean;

  @Field(() => String, { nullable: true })
  clickTrackingHostname: string | null;

  @Field(() => ManagedHostnameStatus, { nullable: true })
  clickTrackingHostnameStatus: ManagedHostnameStatus | null;

  @Field(() => [VerificationRecordDTO], { nullable: true })
  verificationRecords: VerificationRecordDTO[] | null;

  @Field(() => Date, { nullable: true })
  verifiedAt: Date | null;
}
