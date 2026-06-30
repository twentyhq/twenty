import { Field, ObjectType } from '@nestjs/graphql';

import { DpaAgreementEntity } from 'src/engine/core-modules/dpa/entities/dpa-agreement.entity';

@ObjectType('GenerateSignedDpaResult')
export class GenerateSignedDpaResult {
  @Field(() => DpaAgreementEntity)
  agreement: DpaAgreementEntity;

  @Field()
  downloadUrl: string;
}
