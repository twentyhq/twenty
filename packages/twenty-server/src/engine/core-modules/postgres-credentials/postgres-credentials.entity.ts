import { ObjectType } from '@nestjs/graphql';

import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { WorkspaceBoundEntity } from 'src/engine/workspace-manager/workspace-sync/types/workspace-bound-entity';

@Entity({ name: 'postgresCredentials', schema: 'core' })
@ObjectType('PostgresCredentials')
export class PostgresCredentialsEntity extends WorkspaceBoundEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  user: string;

  @Column({ nullable: false })
  passwordHash: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ nullable: true, type: 'timestamptz' })
  deletedAt: Date;
}
