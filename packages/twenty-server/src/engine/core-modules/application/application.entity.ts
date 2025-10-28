import { ObjectType } from '@nestjs/graphql';

import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';

import { ApplicationVariableEntity } from 'src/engine/core-modules/applicationVariable/application-variable.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentEntity } from 'src/engine/metadata-modules/agent/agent.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';

@Entity({ name: 'application', schema: 'core' })
@ObjectType('Application')
@Index('IDX_APPLICATION_WORKSPACE_ID', ['workspaceId'])
@Index(
  'IDX_APPLICATION_UNIVERSAL_IDENTIFIER_WORKSPACE_ID_UNIQUE',
  ['universalIdentifier', 'workspaceId'],
  {
    unique: true,
    where: '"deletedAt" IS NULL AND "universalIdentifier" IS NOT NULL',
  },
)
export class ApplicationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, type: 'uuid' })
  universalIdentifier?: string;

  @Column({ nullable: false, type: 'text' })
  name: string;

  @Column({ nullable: true, type: 'text' })
  description: string | null;

  @Column({ nullable: true, type: 'text' })
  version: string | null;

  @Column({ type: 'text', default: 'local' })
  sourceType: 'local';

  @Column({ nullable: false, type: 'text' })
  sourcePath: string;

  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

  @Column({ nullable: false, type: 'uuid' })
  serverlessFunctionLayerId: string;

  @ManyToOne(() => WorkspaceEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Relation<WorkspaceEntity>;

  @OneToMany(() => AgentEntity, (agent) => agent.application, {
    onDelete: 'CASCADE',
  })
  agents: Relation<AgentEntity[]>;

  @OneToMany(
    () => ServerlessFunctionEntity,
    (serverlessFunction) => serverlessFunction.application,
    {
      onDelete: 'CASCADE',
    },
  )
  serverlessFunctions: Relation<ServerlessFunctionEntity[]>;

  @OneToMany(() => ObjectMetadataEntity, (object) => object.application, {
    onDelete: 'CASCADE',
  })
  objects: Relation<ObjectMetadataEntity[]>;

  @OneToMany(
    () => ApplicationVariableEntity,
    (applicationVariable) => applicationVariable.application,
    {
      onDelete: 'CASCADE',
    },
  )
  applicationVariables: Relation<ApplicationVariableEntity[]>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date | null;
}
