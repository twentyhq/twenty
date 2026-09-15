import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { VerificationRecordPurpose } from 'src/engine/core-modules/emailing-domain/drivers/types/verification-record-purpose.type';

registerEnumType(VerificationRecordPurpose, {
  name: 'VerificationRecordPurpose',
});

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

  @Field(() => String, { nullable: true })
  status?: string;

  @Field(() => VerificationRecordPurpose, { nullable: true })
  purpose?: VerificationRecordPurpose;

  @Field(() => Boolean, { nullable: true })
  isRequired?: boolean;
}
