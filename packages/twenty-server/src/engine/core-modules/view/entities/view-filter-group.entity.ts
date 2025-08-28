import { IDField } from '@ptc-org/nestjs-query-graphql';
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

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ViewFilter } from 'src/engine/core-modules/view/entities/view-filter.entity';
import { View } from 'src/engine/core-modules/view/entities/view.entity';
import { ViewFilterGroupLogicalOperator } from 'src/engine/core-modules/view/enums/view-filter-group-logical-operator';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Entity({ name: 'viewFilterGroup', schema: 'core' })
@Index('IDX_VIEW_FILTER_GROUP_WORKSPACE_ID_VIEW_ID', ['workspaceId', 'viewId'])
export class ViewFilterGroup {
  @IDField(() => UUIDScalarType)
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

  @Column({ nullable: true, type: 'int' })
  positionInViewFilterGroup?: number | null;

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

  @ManyToOne(() => View, (view) => view.viewFilterGroups, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'viewId' })
  view: Relation<View>;

  @OneToMany(() => ViewFilter, (viewFilter) => viewFilter.viewFilterGroup)
  viewFilters: Relation<ViewFilter>[];

  @ManyToOne(
    () => ViewFilterGroup,
    (viewFilterGroup) => viewFilterGroup.childViewFilterGroups,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'parentViewFilterGroupId' })
  parentViewFilterGroup: Relation<ViewFilterGroup>;

  @OneToMany(
    () => ViewFilterGroup,
    (viewFilterGroup) => viewFilterGroup.parentViewFilterGroup,
  )
  childViewFilterGroups: Relation<ViewFilterGroup>[];
}
