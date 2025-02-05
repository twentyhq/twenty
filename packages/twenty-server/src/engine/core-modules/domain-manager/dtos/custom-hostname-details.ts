import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
class CustomHostnameVerification {
  @Field(() => String)
  validationType: 'ownership' | 'ssl';

  @Field(() => String)
  type: 'txt' | 'cname';

  @Field(() => String)
  key: string;

  @Field(() => String)
  value: string;
}

@ObjectType()
export class CustomHostnameDetails {
  @Field(() => String)
  id: string;

  @Field(() => String)
  hostname: string;

  @Field(() => [CustomHostnameVerification])
  records: Array<CustomHostnameVerification>;

  @Field(() => [String])
  verificationErrors: Array<string>;

  @Field(() => String, { nullable: true })
  sslStatus?: string;

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
