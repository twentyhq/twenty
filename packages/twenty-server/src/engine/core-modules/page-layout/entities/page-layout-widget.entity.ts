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

import { WidgetConfigurationInterface } from 'src/engine/core-modules/page-layout/dtos/widget-configuration.interface';
import { PageLayoutTabEntity } from 'src/engine/core-modules/page-layout/entities/page-layout-tab.entity';
import { WidgetType } from 'src/engine/core-modules/page-layout/enums/widget-type.enum';
import { GridPosition } from 'src/engine/core-modules/page-layout/types/grid-position.type';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

@Entity({ name: 'pageLayoutWidget', schema: 'core' })
@Index(
  'IDX_PAGE_LAYOUT_WIDGET_WORKSPACE_ID_PAGE_LAYOUT_TAB_ID',
  ['workspaceId', 'pageLayoutTabId'],
  { where: '"deletedAt" IS NULL' },
)
export class PageLayoutWidgetEntity
  implements Required<PageLayoutWidgetEntity>
{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'uuid' })
  pageLayoutTabId: string;

  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

  @ManyToOne(() => Workspace, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Relation<Workspace>;

  @ManyToOne(() => PageLayoutTabEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'pageLayoutTabId' })
  pageLayoutTab: Relation<PageLayoutTabEntity>;

  @Column({ nullable: false })
  title: string;

  @Column({
    type: 'enum',
    enum: Object.values(WidgetType),
    nullable: false,
    default: WidgetType.VIEW,
  })
  type: WidgetType;

  @Column({ nullable: true, type: 'uuid' })
  objectMetadataId: string | null;

  @ManyToOne(() => ObjectMetadataEntity, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'objectMetadataId' })
  objectMetadata: Relation<ObjectMetadataEntity> | null;

  @Column({ type: 'jsonb', nullable: false })
  gridPosition: GridPosition;

  @Column({ type: 'jsonb', nullable: true })
  configuration: WidgetConfigurationInterface | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date | null;
}
