import { ObjectType } from '@nestjs/graphql';

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

import { PageLayoutWidgetEntity } from 'src/engine/core-modules/page-layout/entities/page-layout-widget.entity';
import { PageLayoutEntity } from 'src/engine/core-modules/page-layout/entities/page-layout.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { StrictSyncableEntity } from 'src/engine/workspace-manager/workspace-sync/interfaces/strict-syncable-entity.interface';

@Entity({ name: 'pageLayoutTab', schema: 'core' })
@ObjectType('PageLayoutTab')
@Index(
  'IDX_PAGE_LAYOUT_TAB_WORKSPACE_ID_PAGE_LAYOUT_ID',
  ['workspaceId', 'pageLayoutId'],
  { where: '"deletedAt" IS NULL' },
)
export class PageLayoutTabEntity
  extends StrictSyncableEntity
  implements Required<PageLayoutTabEntity>
{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

  @ManyToOne(() => WorkspaceEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Relation<WorkspaceEntity>;

  @Column({ nullable: false, type: 'float', default: 0 })
  position: number;

  @Column({ nullable: false, type: 'uuid' })
  pageLayoutId: string;

  @ManyToOne(() => PageLayoutEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'pageLayoutId' })
  pageLayout: Relation<PageLayoutEntity>;

  @OneToMany(() => PageLayoutWidgetEntity, (widget) => widget.pageLayoutTab, {
    cascade: true,
  })
  widgets: Relation<PageLayoutWidgetEntity[]>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date | null;
}
