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
