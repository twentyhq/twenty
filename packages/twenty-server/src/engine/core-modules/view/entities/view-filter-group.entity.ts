import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';

import { SyncableEntity } from 'src/engine/workspace-manager/workspace-sync/interfaces/syncable-entity.interface';

import { ViewFilterEntity } from 'src/engine/core-modules/view/entities/view-filter.entity';
import { ViewEntity } from 'src/engine/core-modules/view/entities/view.entity';
import { ViewFilterGroupLogicalOperator } from 'src/engine/core-modules/view/enums/view-filter-group-logical-operator';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Entity({ name: 'viewFilterGroup', schema: 'core' })
@Index('IDX_VIEW_FILTER_GROUP_WORKSPACE_ID_VIEW_ID', ['workspaceId', 'viewId'])
export class ViewFilterGroupEntity extends SyncableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, type: 'uuid' })
  parentViewFilterGroupId?: string | null;

  @Column({
    type: 'enum',
    enum: Object.values(ViewFilterGroupLogicalOperator),
    nullable: false,
    default: ViewFilterGroupLogicalOperator.AND,
  })
  logicalOperator: ViewFilterGroupLogicalOperator;

  @Column({ nullable: true, type: 'double precision' })
  positionInViewFilterGroup: number | null;

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

  @ManyToOne(() => ViewEntity, (view) => view.viewFilterGroups, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'viewId' })
  view: Relation<ViewEntity>;

  @OneToMany(() => ViewFilterEntity, (viewFilter) => viewFilter.viewFilterGroup)
  viewFilters: Relation<ViewFilterEntity>[];

  @ManyToOne(
    () => ViewFilterGroupEntity,
    (viewFilterGroup) => viewFilterGroup.childViewFilterGroups,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'parentViewFilterGroupId' })
  parentViewFilterGroup: Relation<ViewFilterGroupEntity>;

  @OneToMany(
    () => ViewFilterGroupEntity,
    (viewFilterGroup) => viewFilterGroup.parentViewFilterGroup,
  )
  childViewFilterGroups: Relation<ViewFilterGroupEntity>[];
}
