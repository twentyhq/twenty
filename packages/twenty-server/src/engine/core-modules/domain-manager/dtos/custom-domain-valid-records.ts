import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
class CustomDomainRecord {
  @Field(() => String)
  validationType: 'ssl' | 'redirection';

  @Field(() => String)
  type: 'cname';

  @Field(() => String)
  status: string;

  @Field(() => String)
  key: string;

  @Field(() => String)
  value: string;
}

@ObjectType()
export class CustomDomainValidRecords {
  @Field(() => String)
  id: string;

  @Field(() => String)
  customDomain: string;

  @Field(() => [CustomDomainRecord])
  records: Array<CustomDomainRecord>;
}
