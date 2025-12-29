import { ObjectType } from '@nestjs/graphql';

import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { WorkspaceBoundEntity } from 'src/engine/workspace-manager/workspace-sync/types/workspace-bound-entity';

@Entity('file')
@ObjectType('File')
@Index('IDX_FILE_WORKSPACE_ID', ['workspaceId'])
export class FileEntity extends WorkspaceBoundEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  fullPath: string;

  @Column({ nullable: false, type: 'bigint' })
  size: number;

  @Column({ nullable: false })
  type: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
