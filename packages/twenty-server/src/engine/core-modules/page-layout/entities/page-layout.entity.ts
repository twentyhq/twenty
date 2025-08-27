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

import { PageLayoutType } from 'src/engine/core-modules/page-layout/enums/page-layout-type.enum';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

@Entity({ name: 'pageLayout', schema: 'core' })
@Index('IDX_PAGE_LAYOUT_WORKSPACE_ID', ['workspaceId'])
@Index('IDX_PAGE_LAYOUT_OBJECT_METADATA_ID', ['objectMetadataId'])
export class PageLayoutEntity implements Required<PageLayoutEntity> {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

  @ManyToOne(() => Workspace, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Relation<Workspace>;

  @Column({
    type: 'enum',
    enum: Object.values(PageLayoutType),
    nullable: false,
    default: PageLayoutType.RECORD_PAGE,
  })
  type: PageLayoutType;

  @Column({ nullable: true, type: 'uuid' })
  objectMetadataId: string | null;

  @ManyToOne(() => ObjectMetadataEntity, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'objectMetadataId' })
  objectMetadata: Relation<ObjectMetadataEntity> | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date | null;
}
