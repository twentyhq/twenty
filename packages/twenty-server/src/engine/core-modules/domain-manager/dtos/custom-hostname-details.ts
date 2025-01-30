import { createUnionType, Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
class CustomHostnameOwnershipVerificationTxt {
  @Field(() => String)
  type: 'txt';

  @Field(() => String)
  name: string;

  @Field(() => String)
  value: string;
}

@ObjectType()
class CustomHostnameOwnershipVerificationHttp {
  @Field()
  type: 'http';

  @Field(() => String)
  body: string;

  @Field(() => String)
  url: string;
}

const CustomHostnameOwnershipVerification = createUnionType({
  name: 'OwnershipVerification',
  types: () =>
    [
      CustomHostnameOwnershipVerificationTxt,
      CustomHostnameOwnershipVerificationHttp,
    ] as const,
  resolveType(value) {
    if ('type' in value && value.type === 'txt') {
      return CustomHostnameOwnershipVerificationTxt;
    }
    if ('type' in value && value.type === 'http') {
      return CustomHostnameOwnershipVerificationHttp;
    }

    return null;
  },
});

@ObjectType()
export class CustomHostnameDetails {
  @Field(() => String)
  id: string;

  @Field(() => String)
  hostname: string;

  @Field(() => [CustomHostnameOwnershipVerification])
  ownershipVerifications: Array<typeof CustomHostnameOwnershipVerification>;

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
