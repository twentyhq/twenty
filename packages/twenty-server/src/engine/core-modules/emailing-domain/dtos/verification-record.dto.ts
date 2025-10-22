import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('VerificationRecord')
export class VerificationRecordDTO {
  @Field(() => String)
  type: 'TXT' | 'CNAME' | 'MX';

  @Field(() => String)
  key: string;

  @Field(() => String)
  value: string;

  @Field(() => Number, { nullable: true })
  priority?: number;
}
