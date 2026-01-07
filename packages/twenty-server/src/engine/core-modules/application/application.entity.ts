import { Field, ObjectType } from '@nestjs/graphql';

import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from 'typeorm';

import { ApplicationVariableEntity } from 'src/engine/core-modules/applicationVariable/application-variable.entity';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { RoleDTO } from 'src/engine/metadata-modules/role/dtos/role.dto';
import { ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/workspace-sync/types/workspace-related-entity';

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
export class ApplicationEntity extends WorkspaceRelatedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'uuid' })
  universalIdentifier: string;

  @Column({ nullable: false, type: 'text' })
  name: string;

  @Column({ nullable: true, type: 'text' })
  description: string | null;

  // TODO should not be nullable
  @Column({ nullable: true, type: 'text' })
  version: string | null;

  @Column({ type: 'text', default: 'local' })
  sourceType: 'local';

  @Column({ nullable: false, type: 'text' })
  sourcePath: string;

  @Column({ nullable: true, type: 'uuid' })
  serverlessFunctionLayerId: string | null;

  @Column({ nullable: true, type: 'uuid' })
  defaultServerlessFunctionRoleId: string | null;

  @Field(() => RoleDTO, { nullable: true })
  defaultServerlessFunctionRole: RoleDTO | null;

  @Column({ nullable: false, type: 'boolean', default: true })
  canBeUninstalled: boolean;

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
