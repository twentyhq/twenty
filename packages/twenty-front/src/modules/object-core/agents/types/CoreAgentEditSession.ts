import { type CronScheduleDraft } from '@/workflow/workflow-trigger/types/CronScheduleDraft';
import { type CoreAgent } from '@/object-core/agents/types/CoreAgent';
import { type CoreAgentSettings } from '@/object-core/agents/types/CoreAgentSettings';

export type CoreAgentEditSession = {
  agent: CoreAgent;
  scheduleDrafts?: Record<string, CronScheduleDraft>;
  confirmed: CoreAgentSettings;
  fieldRevisions: Record<keyof CoreAgentSettings, number>;
  submission: {
    settings: CoreAgentSettings;
    fieldRevisions: Record<keyof CoreAgentSettings, number>;
  } | null;
  draft: CoreAgentSettings;
  roleId: string | null;
  isSaving: boolean;
  requiresRefresh: boolean;
  error: string | null;
  resetVersion: number;
};
