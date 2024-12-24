import { Field, ObjectType } from '@nestjs/graphql';

import { CustomHostname } from 'src/engine/core-modules/domain-manager/types/custom-hostname';

@ObjectType()
export class OwnershipVerification {
  @Field(() => String)
  name?: string;

  @Field(() => String)
  type?: 'txt';

  @Field(() => String)
  value?: string;
}

@ObjectType()
export class OwnershipVerificationHttp {
  @Field(() => String)
  http_body?: string;

  @Field(() => String)
  http_url?: string;
}

@ObjectType()
export class CustomHostnameDetails implements Omit<CustomHostname, 'id'> {
  @Field(() => String)
  hostname: string;

  @Field(() => OwnershipVerification, { nullable: true })
  ownership_verification?: OwnershipVerification;

  @Field(() => OwnershipVerificationHttp, { nullable: true })
  ownership_verification_http?: OwnershipVerificationHttp;

  @Field(() => String)
  status?:
    | 'active'
    | 'pending'
    | 'active_redeploying'
    | 'moved'
    | 'pending_deletion'
    | 'deleted'
    | 'pending_blocked'
    | 'pending_migration'
    | 'pending_provisioned'
    | 'test_pending'
    | 'test_active'
    | 'test_active_apex'
    | 'test_blocked'
    | 'test_failed'
    | 'provisioned'
    | 'blocked';
}
