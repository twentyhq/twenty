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

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ViewFilterGroup } from 'src/engine/core-modules/view/entities/view-filter-group.entity';
import { View } from 'src/engine/core-modules/view/entities/view.entity';
import { ViewFilterOperand } from 'src/engine/core-modules/view/enums/view-filter-operand';
import { ViewFilterValue } from 'src/engine/core-modules/view/types/view-filter-value.type';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Entity({ name: 'viewFilter', schema: 'core' })
@Index('IDX_VIEW_FILTER_WORKSPACE_ID_VIEW_ID', ['workspaceId', 'viewId'])
@Index('IDX_VIEW_FILTER_FIELD_METADATA_ID', ['fieldMetadataId'])
export class ViewFilter {
  @IDField(() => UUIDScalarType)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'uuid' })
  fieldMetadataId: string;

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

  @Column({ nullable: true, type: 'int' })
  positionInViewFilterGroup?: number | null;

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

  @ManyToOne(() => View, (view) => view.viewFilters, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'viewId' })
  view: Relation<View>;

  @ManyToOne(
    () => ViewFilterGroup,
    (viewFilterGroup) => viewFilterGroup.viewFilters,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'viewFilterGroupId' })
  viewFilterGroup: Relation<ViewFilterGroup>;
}
