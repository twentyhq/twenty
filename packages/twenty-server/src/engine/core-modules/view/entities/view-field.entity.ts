import { IDField } from '@ptc-org/nestjs-query-graphql';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';

import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { View } from 'src/engine/core-modules/view/entities/view.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Entity({ name: 'viewField', schema: 'core' })
@Index('IDX_VIEW_FIELD_WORKSPACE_ID_VIEW_ID', ['workspaceId', 'viewId'])
@Index(
  'IDX_VIEW_FIELD_FIELD_METADATA_ID_VIEW_ID_UNIQUE',
  ['fieldMetadataId', 'viewId'],
  {
    unique: true,
    where: '"deletedAt" IS NULL',
  },
)
export class ViewField {
  @IDField(() => UUIDScalarType)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'uuid' })
  fieldMetadataId: string;

  @Column({ nullable: false, default: true })
  isVisible: boolean;

  @Column({ nullable: false, type: 'int', default: 0 })
  size: number;

  @Column({ nullable: false, type: 'int', default: 0 })
  position: number;

  @Column({
    type: 'enum',
    enum: Object.values(AggregateOperations),
    nullable: true,
    default: null,
  })
  aggregateOperation?: AggregateOperations | null;

  @Column({ nullable: false, type: 'uuid' })
  viewId: string;

  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt?: Date | null;

  @ManyToOne(() => Workspace, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Relation<Workspace>;

  @ManyToOne(() => View, (view) => view.viewFields, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'viewId' })
  view: Relation<View>;
}
