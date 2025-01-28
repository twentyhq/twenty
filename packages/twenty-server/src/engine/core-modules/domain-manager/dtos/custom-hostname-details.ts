import { Field, ObjectType } from '@nestjs/graphql';

import { CustomHostname } from 'src/engine/core-modules/domain-manager/types/custom-hostname.type';

// Type come from: https://developers.cloudflare.com/api/node/resources/custom_hostnames/methods/list/#(merged%20schema)%20%3E%20(property)%20result%20%3E%20(items)%20%3E%20(property)%20ownership_verification
@ObjectType()
class OwnershipVerification {
  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => String, { nullable: true })
  type?: 'txt';

  @Field(() => String, { nullable: true })
  value?: string;
}

// Type come from: https://developers.cloudflare.com/api/node/resources/custom_hostnames/methods/list/#(merged%20schema)%20%3E%20(property)%20result%20%3E%20(items)%20%3E%20(property)%20ownership_verification_http
@ObjectType()
class OwnershipVerificationHttp {
  @Field(() => String, { nullable: true })
  http_body?: string;

  @Field(() => String, { nullable: true })
  http_url?: string;
}

// Type come from: https://developers.cloudflare.com/api/node/resources/custom_hostnames/methods/list/#(merged%20schema)%20%3E%20(property)%20result%20%3E%20(items)
@ObjectType()
export class CustomHostnameDetails implements Omit<CustomHostname, 'id'> {
  @Field(() => String)
  hostname: string;

  @Field(() => OwnershipVerification, { nullable: true })
  ownership_verification?: OwnershipVerification;

  @Field(() => OwnershipVerificationHttp, { nullable: true })
  ownership_verification_http?: OwnershipVerificationHttp;

  @Field(() => String, { nullable: true })
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
