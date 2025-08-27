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

import { PageLayoutEntity } from 'src/engine/core-modules/page-layout/entities/page-layout.entity';

@Entity({ name: 'pageLayoutTab', schema: 'core' })
@Index('IDX_PAGE_LAYOUT_TAB_PAGE_LAYOUT_ID', ['pageLayoutId'])
export class PageLayoutTabEntity implements Required<PageLayoutTabEntity> {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: false, type: 'int', default: 0 })
  position: number;

  @Column({ nullable: false, type: 'uuid' })
  pageLayoutId: string;

  @ManyToOne(() => PageLayoutEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'pageLayoutId' })
  pageLayout: Relation<PageLayoutEntity>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date | null;
}
