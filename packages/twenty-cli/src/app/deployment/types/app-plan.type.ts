export type AppPlanAction = {
  type: 'create' | 'update' | 'delete';
  metadataName: string;
  universalIdentifier?: string;
  flatEntity?: Record<string, unknown>;
  diff?: Record<string, { before?: unknown; after?: unknown }>;
};

export type AppPlanSummary = {
  create: number;
  update: number;
  delete: number;
  destructive: number;
};

export type AppTranslationPlanAction = {
  type: AppPlanAction['type'];
  messageLabels?: Record<string, string>;
  metadataName: 'applicationTranslation';
  locale: string;
  diff: Record<string, { before: string | null; after: string | null }>;
};

export type AppPlan = {
  actions: AppPlanAction[];
  translationActions: AppTranslationPlanAction[] | null;
};
