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

import { ViewEntity } from 'src/engine/core-modules/view/entities/view.entity';
import { ViewSortDirection } from 'src/engine/core-modules/view/enums/view-sort-direction';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

@Entity({ name: 'viewSort', schema: 'core' })
@Index('IDX_VIEW_SORT_WORKSPACE_ID_VIEW_ID', ['workspaceId', 'viewId'])
@Index(
  'IDX_VIEW_SORT_FIELD_METADATA_ID_VIEW_ID_UNIQUE',
  ['fieldMetadataId', 'viewId'],
  {
    unique: true,
    where: '"deletedAt" IS NULL',
  },
)
export class ViewSortEntity extends SyncableEntity {
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
    enum: Object.values(ViewSortDirection),
    default: ViewSortDirection.ASC,
  })
  direction: ViewSortDirection;

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

  @ManyToOne(() => ViewEntity, (view) => view.viewSorts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'viewId' })
  view: Relation<ViewEntity>;
}
