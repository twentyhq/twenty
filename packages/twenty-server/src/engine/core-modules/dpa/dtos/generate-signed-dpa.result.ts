import { Field, ObjectType } from '@nestjs/graphql';

import { DpaAgreementEntity } from 'src/engine/core-modules/dpa/entities/dpa-agreement.entity';

// Result of executing a signed DPA: the persisted legal record plus a signed,
// time-limited URL to download the executed PDF.
@ObjectType('GenerateSignedDpaResult')
export class GenerateSignedDpaResult {
  @Field(() => DpaAgreementEntity)
  agreement: DpaAgreementEntity;

  @Field()
  downloadUrl: string;
}
