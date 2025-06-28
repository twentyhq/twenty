import { Field, ObjectType } from '@nestjs/graphql';

import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';

import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { TwoFactorAuthenticationProviders } from 'twenty-shared/workspace';

@Index(['userWorkspaceId', 'strategy'], { unique: true })
@Entity({ name: 'twoFactorMethod', schema: 'core' })
@ObjectType()
export class TwoFactorMethod {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field({ nullable: false })
  @Column({ nullable: false, type: 'uuid' })
  userWorkspaceId: string;

  @Field(() => UserWorkspace)
  @ManyToOne(
    () => UserWorkspace,
    (userWorkspace) => userWorkspace.twoFactorMethods,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'userWorkspaceId' })
  userWorkspace: Relation<UserWorkspace>;

  @Column({ nullable: true, type: 'jsonb' })
  context: { status: string; secret: string; timestep: string } | null;

  @Field(() => TwoFactorAuthenticationProviders)
  @Column({
    type: 'enum',
    enum: TwoFactorAuthenticationProviders,
  })
  strategy: TwoFactorAuthenticationProviders;

  @Field()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Field({ nullable: true })
  @Column({ nullable: true, type: 'timestamptz' })
  deletedAt: Date;
}
