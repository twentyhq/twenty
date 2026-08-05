import { type ActorApplicationUniversalIdentifierColumnTarget } from 'src/database/commands/upgrade-version-command/2-28/utils/build-actor-application-universal-identifier-column-targets.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export const buildAddActorApplicationUniversalIdentifierColumnsSql = ({
  schemaName,
  actorApplicationUniversalIdentifierColumnTarget,
}: {
  schemaName: string;
  actorApplicationUniversalIdentifierColumnTarget: ActorApplicationUniversalIdentifierColumnTarget;
}): string =>
  `ALTER TABLE ${escapeIdentifier(schemaName)}.${escapeIdentifier(actorApplicationUniversalIdentifierColumnTarget.tableName)} ${actorApplicationUniversalIdentifierColumnTarget.columnNames
    .map(
      (columnName) =>
        `ADD COLUMN IF NOT EXISTS ${escapeIdentifier(columnName)} uuid`,
    )
    .join(', ')}`;
