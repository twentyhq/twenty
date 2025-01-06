import { Field, ObjectType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';
import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    Relation,
    UpdateDateColumn,
} from 'typeorm';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { Permission } from 'src/engine/core-modules/permission/permission.entity';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Entity({ name: 'role', schema: 'core' })
@ObjectType('Role')
export class Role {
  @IDField(() => UUIDScalarType)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ default: '' })
  name: string;

  @Field()
  @Column({ default: '' })
  description: string;

  @Field()
  @Column({ default: false })
  canAccessWorkspaceSettings: boolean;

  @Field({ defaultValue: true })
  @Column({ default: true })
  isActive: boolean;

  @Field({ defaultValue: true })
  @Column({ default: true })
  isCustom: boolean;

  @Field({ defaultValue: '' })
  @Column({ default: '' })
  icon: string;

  @Field()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Role, { nullable: true })
  @Field(() => Role, { nullable: true })
  reportsTo?: Role;

  @OneToMany(() => Permission, (permission) => permission.role)
  @Field(() => [Permission])
  permissions: Relation<Permission[]>;

  @Field(() => Workspace)
  @ManyToOne(() => Workspace, { onDelete: 'CASCADE' })
  workspace: Relation<Workspace>;

  @Field(() => [UserWorkspace])
  @OneToMany(() => UserWorkspace, (user) => user.role)
  users: Relation<UserWorkspace[]>;
}
