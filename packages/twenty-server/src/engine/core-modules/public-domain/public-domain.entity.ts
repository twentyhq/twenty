import { ObjectType } from '@nestjs/graphql';

import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { WorkspaceBoundEntity } from 'src/engine/workspace-manager/workspace-sync/types/workspace-bound-entity';

@Entity({ name: 'publicDomain', schema: 'core' })
@ObjectType('PublicDomain')
export class PublicDomainEntity extends WorkspaceBoundEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ type: 'varchar', nullable: false, unique: true })
  domain: string;

  @Column({ type: 'boolean', default: false, nullable: false })
  isValidated: boolean;
}
