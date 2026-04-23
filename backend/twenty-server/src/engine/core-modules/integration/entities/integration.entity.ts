import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { IntegrationProvider, IntegrationStatus } from '../enums/integration-provider.enum';

registerEnumType(IntegrationProvider, {
  name: 'IntegrationProvider',
});

registerEnumType(IntegrationStatus, {
  name: 'IntegrationStatus',
});

@Entity({ name: 'integration', schema: 'core' })
@ObjectType('Integration')
@Index('IDX_INTEGRATION_WORKSPACE_PROVIDER', ['workspaceId', 'provider'], { unique: true })
export class IntegrationEntity {
  @IDField(() => UUIDScalarType)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => UUIDScalarType)
  @Column({ type: 'uuid', nullable: false })
  workspaceId: string;

  @ManyToOne(() => WorkspaceEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Relation<WorkspaceEntity>;

  @Field(() => IntegrationProvider)
  @Column({
    type: 'enum',
    enumName: 'integration_provider_enum',
    enum: IntegrationProvider,
    nullable: false,
  })
  provider: IntegrationProvider;

  @Field(() => IntegrationStatus)
  @Column({
    type: 'enum',
    enumName: 'integration_status_enum',
    enum: IntegrationStatus,
    default: IntegrationStatus.PENDING,
  })
  status: IntegrationStatus;

  @Column({ type: 'varchar', nullable: true })
  accessToken: string | null;

  @Column({ type: 'varchar', nullable: true })
  refreshToken: string | null;

  @Column({ type: 'varchar', nullable: true })
  apiKey: string | null;

  @Column({ type: 'varchar', nullable: true })
  apiSecret: string | null;

  @Column({ type: 'varchar', nullable: true })
  webhookUrl: string | null;

  @Column({ type: 'jsonb', nullable: true })
  settings: Record<string, unknown> | null;

  @Column({ type: 'timestamptz', nullable: true })
  lastSyncAt: Date | null;

  @Field()
  @Column({ type: 'timestamptz', default: () => 'NOW()' })
  createdAt: Date;

  @Field()
  @Column({ type: 'timestamptz', default: () => 'NOW()' })
  updatedAt: Date;
}
