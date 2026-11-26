import { type AgentManifest } from 'twenty-shared/application';

import { type DatabaseEventTriggerManifestLookup } from 'src/engine/core-modules/application/application-manifest/types/database-event-trigger-manifest-lookup.type';
import { resolveDatabaseEventTriggerManifestSettingsOrThrow } from 'src/engine/core-modules/application/application-manifest/utils/resolve-database-event-trigger-manifest-settings-or-throw.util';

// TODO: remove with the legacy databaseEventTriggerSettings / DATABASE_EVENT manifest form
export const resolveAgentTriggerManifestsOrThrow = ({
  agentManifest,
  lookup,
}: {
  agentManifest: AgentManifest;
  lookup: DatabaseEventTriggerManifestLookup;
}): AgentManifest['triggers'] =>
  agentManifest.triggers?.map((trigger) =>
    trigger.type === 'EVENT' || trigger.type === 'DATABASE_EVENT'
      ? {
          ...trigger,
          type: 'DATABASE_EVENT' as const,
          settings: resolveDatabaseEventTriggerManifestSettingsOrThrow({
            settings: trigger.settings,
            lookup,
            subject: `Agent ${agentManifest.name}`,
          }),
        }
      : trigger,
  );
