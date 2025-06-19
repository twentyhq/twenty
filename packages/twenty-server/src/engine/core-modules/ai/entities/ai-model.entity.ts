import { registerEnumType } from '@nestjs/graphql';

import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ModelProvider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
}

registerEnumType(ModelProvider, { name: 'ModelProvider' });

@Entity({ name: 'aiModel', schema: 'core' })
export class AIModel {
  @PrimaryColumn({ type: 'varchar', unique: true })
  modelId: string;

  @Column({ nullable: true, type: 'timestamptz' })
  deletedAt?: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ nullable: false })
  displayName: string;

  @Column({
    type: 'enum',
    enum: ModelProvider,
    enumName: 'ModelProvider_enum',
    nullable: false,
  })
  provider: ModelProvider;

  @Column('decimal', { precision: 10, scale: 4 })
  inputCostPer1kTokensInCents: number;

  @Column('decimal', { precision: 10, scale: 4 })
  outputCostPer1kTokensInCents: number;

  @Column({ nullable: false, default: true })
  isActive: boolean;

  @Column({ nullable: false, default: false })
  isDefault: boolean;
}
