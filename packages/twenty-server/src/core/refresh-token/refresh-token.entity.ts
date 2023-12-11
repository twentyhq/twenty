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

import { User } from 'src/core/user/user.entity';

import { BeforeCreateOneRefreshToken } from './hooks/before-create-one-refresh-token.hook';

@Entity({ name: 'refreshToken', schema: 'core' })
@ObjectType('RefreshToken')
@BeforeCreateOne(BeforeCreateOneRefreshToken)
export class RefreshToken {
  @IDField(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.refreshTokens, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

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
