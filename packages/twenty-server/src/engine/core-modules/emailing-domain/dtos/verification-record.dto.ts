import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class VerificationRecord {
  @Field(() => String)
  type: 'TXT' | 'CNAME' | 'MX';

  @Field(() => String)
  name: string;

  @Field(() => String)
  value: string;

  @Field(() => Number, { nullable: true })
  priority?: number;
}
