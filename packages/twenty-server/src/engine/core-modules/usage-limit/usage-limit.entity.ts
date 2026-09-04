import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { type LimitKind } from 'src/engine/core-modules/usage-limit/types/limit-kind.type';
import { type LimitValueType } from 'src/engine/core-modules/usage-limit/types/limit-value-type.type';
import { type SpenderType } from 'src/engine/core-modules/usage-limit/types/spender-type.type';
import { type PeriodUnit } from 'src/engine/core-modules/usage-limit/types/period-unit.type';
import { type UsageMeter } from 'src/engine/core-modules/usage-limit/types/usage-meter.type';
import { nullableBigintColumnTransformer } from 'src/engine/core-modules/usage-limit/utils/nullable-bigint-column-transformer.util';
import { type UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity';

@Unique('UQ_USAGE_LIMIT_SCOPE', [
  'workspaceId',
  'resourceType',
  'operationType',
  'spenderType',
  'spenderId',
  'limitKind',
  'periodCount',
  'periodUnit',
  'meter',
])
@Entity({ name: 'usageLimit', schema: 'core' })
export class UsageLimitEntity extends WorkspaceRelatedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  resourceType: UsageResourceType;

  @Column({ type: 'varchar' })
  operationType: UsageOperationType;

  @Column({ type: 'varchar' })
  spenderType: SpenderType;

  @Column({ type: 'varchar', default: '' })
  spenderId: string;

  @Column({ type: 'varchar' })
  limitKind: LimitKind;

  @Column({ type: 'int' })
  periodCount: number;

  @Column({ type: 'varchar' })
  periodUnit: PeriodUnit;

  @Column({ type: 'varchar' })
  meter: UsageMeter;

  @Column({ type: 'varchar' })
  limitValueType: LimitValueType;

  @Column({ type: 'bigint', transformer: nullableBigintColumnTransformer })
  limitValue: number;

  @Column({
    type: 'bigint',
    nullable: true,
    transformer: nullableBigintColumnTransformer,
  })
  burstValue: number | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
