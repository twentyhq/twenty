import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
class CustomDomainVerification {
  @Field(() => String)
  validationType: 'ownership' | 'ssl' | 'redirection';

  @Field(() => String)
  type: 'txt' | 'cname';

  @Field(() => String)
  key: string;

  @Field(() => String)
  status: string;

  @Field(() => String)
  value: string;
}

@ObjectType()
export class CustomDomainDetails {
  @Field(() => String)
  id: string;

  @Field(() => String)
  customDomain: string;

  @Field(() => [CustomDomainVerification])
  records: Array<CustomDomainVerification>;
}
