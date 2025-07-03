import { Field, ObjectType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { Inbox } from 'src/engine/core-modules/inbox/inbox.entity';
import { Sector } from 'src/engine/core-modules/sector/sector.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Entity({ name: 'workspaceAgent', schema: 'core' })
@ObjectType('WorkspaceAgent')
export class WorkspaceAgent {
  @IDField(() => UUIDScalarType)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field({ nullable: false })
  @Column({ nullable: false })
  memberId: string;

  @Field()
  @Column({ default: false })
  isAdmin: boolean;

  @Field()
  @Column({ default: true })
  isActive: boolean;

  @Field()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Field(() => Workspace)
  @ManyToOne(() => Workspace, (workspace) => workspace.workspaceAgents)
  workspace: Relation<Workspace>;

  @Field(() => [Sector])
  @ManyToMany(() => Sector, (sector) => sector.agents)
  @JoinTable({
    name: 'agentSectors',
  })
  sectors: Sector[];

  @Field(() => [Inbox])
  @ManyToMany(() => Inbox, (inbox) => inbox.agents)
  @JoinTable({
    name: 'agentInboxes',
  })
  inboxes: Inbox[];
}
