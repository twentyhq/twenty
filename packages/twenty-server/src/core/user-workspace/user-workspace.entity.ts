import { Field, ID, ObjectType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from 'src/core/user/user.entity';
import { Workspace } from 'src/core/workspace/workspace.entity';

@Entity({ name: 'userWorkspace', schema: 'core' })
@ObjectType('UserWorkspace')
export class UserWorkspace {
  @IDField(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @JoinColumn({ name: 'workspaceId' })
  workspace: Workspace;

  @Column()
  workspaceId: string;

  @Column()
  position: number;

  @Field()
  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
