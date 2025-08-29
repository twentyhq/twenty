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

import { SyncableEntity } from 'src/engine/workspace-manager/workspace-sync/interfaces/syncable-entity.interface';

import { ViewFilterGroupEntity } from 'src/engine/core-modules/view/entities/view-filter-group.entity';
import { ViewEntity } from 'src/engine/core-modules/view/entities/view.entity';
import { ViewFilterOperand } from 'src/engine/core-modules/view/enums/view-filter-operand';
import { ViewFilterValue } from 'src/engine/core-modules/view/types/view-filter-value.type';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

@Entity({ name: 'viewFilter', schema: 'core' })
@Index('IDX_VIEW_FILTER_WORKSPACE_ID_VIEW_ID', ['workspaceId', 'viewId'])
@Index('IDX_VIEW_FILTER_FIELD_METADATA_ID', ['fieldMetadataId'])
export class ViewFilterEntity extends SyncableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'uuid' })
  fieldMetadataId: string;

  @ManyToOne(() => FieldMetadataEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'fieldMetadataId' })
  fieldMetadata: Relation<FieldMetadataEntity>;

  @Column({
    nullable: false,
    type: 'enum',
    enum: Object.values(ViewFilterOperand),
    default: ViewFilterOperand.CONTAINS,
  })
  operand: ViewFilterOperand;

  @Column({ nullable: false, type: 'jsonb' })
  value: ViewFilterValue;

  @Column({ nullable: true, type: 'uuid' })
  viewFilterGroupId?: string | null;

  @Column({ nullable: true, type: 'double precision' })
  positionInViewFilterGroup: number | null;

  @Column({ nullable: true, type: 'text', default: null })
  subFieldName?: string | null;

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

  @ManyToOne(() => ViewEntity, (view) => view.viewFilters, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'viewId' })
  view: Relation<ViewEntity>;

  @ManyToOne(
    () => ViewFilterGroupEntity,
    (viewFilterGroup) => viewFilterGroup.viewFilters,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'viewFilterGroupId' })
  viewFilterGroup: Relation<ViewFilterGroupEntity>;
}
