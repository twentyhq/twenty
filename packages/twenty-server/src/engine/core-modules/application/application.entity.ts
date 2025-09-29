import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentEntity } from 'src/engine/metadata-modules/agent/agent.entity';
import { ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import { PackageJson } from 'src/engine/core-modules/application/types/application.types';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

@Entity({ name: 'application', schema: 'core' })
@Index('IDX_APPLICATION_WORKSPACE_ID', ['workspaceId'])
@Index(
  'IDX_APPLICATION_STANDARD_ID_WORKSPACE_ID_UNIQUE',
  ['standardId', 'workspaceId'],
  {
    unique: true,
    where: '"deletedAt" IS NULL AND "standardId" IS NOT NULL',
  },
)
export class ApplicationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, type: 'uuid' })
  standardId?: string;

  @Column({ nullable: false, type: 'text' })
  label: string;

  @Column({ nullable: true, type: 'text' })
  description: string | null;

  @Column({ nullable: true, type: 'text' })
  version: string | null;

  @Column({ type: 'text', default: 'local' })
  sourceType: 'local';

  @Column({ nullable: false, type: 'text' })
  sourcePath: string;

  @Column({ nullable: true, type: 'jsonb' })
  packageJson: PackageJson | null;

  @Column({ nullable: true, type: 'text' })
  yarnLock: string;

  @Column({ nullable: true, type: 'text' })
  packageChecksum: string;

  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

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

  @ManyToOne(() => Workspace, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Relation<Workspace>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
