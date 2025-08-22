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

import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ViewField } from 'src/engine/core-modules/view/entities/view-field.entity';
import { ViewFilterGroup } from 'src/engine/core-modules/view/entities/view-filter-group.entity';
import { ViewFilter } from 'src/engine/core-modules/view/entities/view-filter.entity';
import { ViewGroup } from 'src/engine/core-modules/view/entities/view-group.entity';
import { ViewSort } from 'src/engine/core-modules/view/entities/view-sort.entity';
import { ViewKey } from 'src/engine/core-modules/view/enums/view-key.enum';
import { ViewOpenRecordIn } from 'src/engine/core-modules/view/enums/view-open-record-in';
import { ViewType } from 'src/engine/core-modules/view/enums/view-type.enum';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Entity({ name: 'view', schema: 'core' })
@Index('IDX_VIEW_WORKSPACE_ID_OBJECT_METADATA_ID', [
  'workspaceId',
  'objectMetadataId',
])
export class View {
  @IDField(() => UUIDScalarType)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'text', default: '' })
  name: string;

  @Column({ nullable: false, type: 'uuid' })
  objectMetadataId: string;

  @Column({
    type: 'enum',
    enum: Object.values(ViewType),
    nullable: false,
    default: ViewType.TABLE,
  })
  type: ViewType;

  @Column({
    type: 'enum',
    enum: Object.values(ViewKey),
    nullable: true,
    default: null,
  })
  key: ViewKey | null;

  @Column({ nullable: false, type: 'text' })
  icon: string;

  @Column({ nullable: false, type: 'int', default: 0 })
  position: number;

  @Column({ nullable: false, default: false, type: 'boolean' })
  isCompact: boolean;

  @Column({ nullable: false, default: false, type: 'boolean' })
  isCustom: boolean;

  @Column({
    type: 'enum',
    enum: Object.values(ViewOpenRecordIn),
    nullable: false,
    default: ViewOpenRecordIn.SIDE_PANEL,
  })
  openRecordIn: ViewOpenRecordIn;

  @Column({
    type: 'enum',
    enum: Object.values(AggregateOperations),
    nullable: true,
    default: null,
  })
  kanbanAggregateOperation?: AggregateOperations | null;

  @Column({ nullable: true, type: 'uuid' })
  kanbanAggregateOperationFieldMetadataId?: string | null;

  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt?: Date | null;

  @Column({ nullable: true, type: 'text', default: null })
  anyFieldFilterValue?: string | null;

  @ManyToOne(() => Workspace, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Relation<Workspace>;

  @OneToMany(() => ViewField, (viewField) => viewField.view)
  viewFields: Relation<ViewField[]>;

  @OneToMany(() => ViewFilter, (viewFilter) => viewFilter.view)
  viewFilters: Relation<ViewFilter[]>;

  @OneToMany(() => ViewSort, (viewSort) => viewSort.view)
  viewSorts: Relation<ViewSort[]>;

  @OneToMany(() => ViewGroup, (viewGroup) => viewGroup.view)
  viewGroups: Relation<ViewGroup[]>;

  @OneToMany(() => ViewFilterGroup, (viewFilterGroup) => viewFilterGroup.view)
  viewFilterGroups: Relation<ViewFilterGroup[]>;
}
