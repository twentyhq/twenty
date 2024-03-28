import { Field, ID, ObjectType } from '@nestjs/graphql';

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BeforeCreateOne, IDField } from '@ptc-org/nestjs-query-graphql';

import { BeforeCreateOneAppToken } from 'src/engine/core-modules/app-token/hooks/before-create-one-app-token.hook';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
export enum AppTokenType {
  RefreshToken = 'REFRESH_TOKEN',
}

@Entity({ name: 'appToken', schema: 'core' })
@ObjectType('AppToken')
@BeforeCreateOne(BeforeCreateOneAppToken)
export class AppToken {
  @IDField(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.appTokens, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Workspace, (workspace) => workspace.appTokens, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Workspace;

  @Column({ nullable: true })
  workspaceId: string;

  @Field()
  @Column({ nullable: false, type: 'text', default: AppTokenType.RefreshToken })
  type: AppTokenType;

  @Column({ nullable: true, type: 'text' })
  value: string;

  @Field()
  @Column('timestamp with time zone')
  expiresAt: Date;

  @Column('timestamp with time zone', { nullable: true })
  deletedAt: Date | null;

  @Column('timestamp with time zone', { nullable: true })
  revokedAt: Date | null;

  @Field()
  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
