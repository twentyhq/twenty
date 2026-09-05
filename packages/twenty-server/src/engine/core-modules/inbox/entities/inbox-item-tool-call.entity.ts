import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { InboxItemEntity } from 'src/engine/core-modules/inbox/entities/inbox-item.entity';
import { InboxItemToolCallStatus } from 'src/engine/core-modules/inbox/enums/inbox-item-tool-call-status.enum';
import { type InboxItemFieldSchema } from 'src/engine/core-modules/inbox/types/inbox-item-field-schema.type';
import { type InboxItemToolCallInput } from 'src/engine/core-modules/inbox/types/inbox-item-tool-call-input.type';
import { CREATE_INBOX_TABLES_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-39/create-inbox-tables-upgrade-command-name.constant';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type JsonbProperty } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/jsonb-property.type';

// One call an agent proposed to make on the world, waiting for a person. The
// proposed input is what the agent wrote and never changes; the edited input is
// what the person made of it, and is what runs. Keeping both is what lets the
// item show what was changed before it was approved.
@Entity({ name: 'inboxItemToolCall', schema: 'core' })
@WasIntroducedInUpgrade({
  upgradeCommandName: CREATE_INBOX_TABLES_UPGRADE_COMMAND_NAME,
})
@Index('IDX_INBOX_ITEM_TOOL_CALL_INBOX_ITEM_ID_POSITION', [
  'inboxItemId',
  'position',
])
@Index('IDX_INBOX_ITEM_TOOL_CALL_WORKSPACE_ID', ['workspaceId'])
export class InboxItemToolCallEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

  @ManyToOne(() => WorkspaceEntity, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'workspaceId',
    foreignKeyConstraintName: 'FK_INBOX_ITEM_TOOL_CALL_WORKSPACE_ID',
  })
  workspace: EntityRelation<WorkspaceEntity>;

  @Column({ nullable: false, type: 'uuid' })
  inboxItemId: string;

  @ManyToOne(() => InboxItemEntity, (inboxItem) => inboxItem.toolCalls, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'inboxItemId',
    foreignKeyConstraintName: 'FK_INBOX_ITEM_TOOL_CALL_INBOX_ITEM_ID',
  })
  inboxItem: EntityRelation<InboxItemEntity>;

  @Column({ nullable: false, type: 'integer' })
  position: number;

  // The tool the call names, in the tool registry's vocabulary
  @Column({ nullable: false, type: 'varchar' })
  toolName: string;

  @Column({ nullable: false, type: 'varchar' })
  label: string;

  // One line saying why the agent proposed it, shown next to the label
  @Column({ nullable: true, type: 'varchar' })
  description: string | null;

  @Column({ nullable: true, type: 'varchar' })
  icon: string | null;

  // The fields the editor offers. Derived from the tool's input schema by the
  // producer, so the editor needs no registry lookup to draw a form.
  @Column({ type: 'jsonb', nullable: false, default: '[]' })
  inputSchema: JsonbProperty<InboxItemFieldSchema[]>;

  @Column({ type: 'jsonb', nullable: false, default: '{}' })
  proposedInput: JsonbProperty<InboxItemToolCallInput>;

  @Column({ type: 'jsonb', nullable: true })
  editedInput: JsonbProperty<InboxItemToolCallInput> | null;

  @Column({
    type: 'enum',
    enum: Object.values(InboxItemToolCallStatus),
    nullable: false,
    default: InboxItemToolCallStatus.PROPOSED,
  })
  status: InboxItemToolCallStatus;

  @Column({ type: 'jsonb', nullable: true })
  output: JsonbProperty<InboxItemToolCallInput> | null;

  @Column({ nullable: true, type: 'text' })
  error: string | null;

  @Column({ nullable: true, type: 'uuid' })
  resolvedByUserWorkspaceId: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  resolvedAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
