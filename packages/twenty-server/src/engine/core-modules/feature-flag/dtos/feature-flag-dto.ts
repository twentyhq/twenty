import { Field, ObjectType } from '@nestjs/graphql';

import { Column } from 'typeorm';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';

@ObjectType('FeatureFlagDTO')
export class FeatureFlagDTO {
  @Field(() => FeatureFlagKey)
  @Column({ nullable: false, type: 'text' })
  key: FeatureFlagKey;

  @Field()
  @Column({ nullable: false })
  value: boolean;
}
