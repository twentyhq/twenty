import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
class CustomDomainRecord {
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
export class CustomDomainValidRecords {
  @Field(() => String)
  id: string;

  @Field(() => String)
  customDomain: string;

  @Field(() => [CustomDomainRecord])
  records: Array<CustomDomainRecord>;
}
