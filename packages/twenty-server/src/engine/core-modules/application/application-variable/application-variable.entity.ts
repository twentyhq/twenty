import { ObjectType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';
import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';

@Entity({
  name: 'applicationVariable',
  schema: 'core',
})
@ObjectType('ApplicationVariable')
// Constrains `value` for secret rows to the versioned envelope, while
// leaving plaintext non-secret values untouched. The keyId portion is
// not constrained so future ENCRYPTION_KEY rotations do not need a DDL
// migration.
@Check(
  'CHK_applicationVariable_value_encrypted',
  `"isSecret" = false OR "value" = '' OR "value" LIKE 'enc:v2:%'`,
)
export class ApplicationVariableEntity extends SyncableEntity {
  @IDField(() => UUIDScalarType)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'text' })
  key: string;

  @Column({ nullable: false, type: 'text', default: '' })
  value: string;

  @Column({ nullable: false, type: 'text', default: '' })
  description: string;

  @Column({ nullable: false, type: 'boolean', default: false })
  isSecret: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
