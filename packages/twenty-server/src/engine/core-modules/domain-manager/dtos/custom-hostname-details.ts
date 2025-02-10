import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
class CustomHostnameVerification {
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
export class CustomHostnameDetails {
  @Field(() => String)
  id: string;

  @Field(() => String)
  hostname: string;

  @Field(() => [CustomHostnameVerification])
  records: Array<CustomHostnameVerification>;
}
