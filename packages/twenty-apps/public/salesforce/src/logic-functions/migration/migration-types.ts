export type SalesforceRecord = Record<string, unknown> & { Id: string };

export type MigrationObjectKey =
  | 'account'
  | 'contact'
  | 'lead'
  | 'opportunity'
  | 'task'
  | 'note';

export type TargetRef = {
  targetKind: 'person' | 'company' | 'opportunity';
  salesforceId: string;
};

export type MappedRecord = {
  salesforceId: string;
  data: Record<string, unknown>;
  // Salesforce AccountId to resolve into a Twenty companyId before writing.
  companyRef?: string;
  // Records (person/company/opportunity) to attach via taskTargets/noteTargets.
  targetRefs?: TargetRef[];
};

export type MappingContext = {
  currencyIsoCode: string;
};

export type MigrationObjectDefinition = {
  key: MigrationObjectKey;
  salesforceObject: string;
  targetObjectSingular: string;
  targetObjectPlural: string;
  itemLabel: string;
  processingOrder: number;
  soqlFields: string[];
  soqlWhere?: string;
  fieldMapping: Record<string, string>;
  relationNotes: string[];
};

export type MigrationPlanObject = {
  key: MigrationObjectKey;
  salesforceObject: string;
  targetObject: string;
  label: string;
  recordCount: number;
  fieldMapping: Record<string, string>;
  relationNotes: string[];
};

export type MigrationPlan = {
  version: 1;
  orgId: string;
  orgName: string;
  currencyIsoCode: string;
  apiVersion: string;
  objects: MigrationPlanObject[];
  warnings: string[];
  totalRecords: number;
  generatedAt: string;
};

export type MigrationRecord = {
  id: string;
  name: string | null;
  status: string;
  totalRecords: number | null;
  processedRecords: number | null;
  createdRecords: number | null;
  updatedRecords: number | null;
  failedRecords: number | null;
  heartbeatAt: string | null;
  salesforceOrgId: string | null;
  plan: MigrationPlan | null;
};

export type MigrationItemRecord = {
  id: string;
  name: string | null;
  status: string;
  salesforceObject: string;
  processingOrder: number | null;
  recordCount: number | null;
  processedCount: number | null;
  createdCount: number | null;
  updatedCount: number | null;
  failedCount: number | null;
  lastProcessedId: string | null;
  batchRetryCount: number | null;
};

export type RecordFailure = {
  salesforceId: string;
  salesforceObject: string;
  message: string;
  recordData: Record<string, unknown>;
};

export type BatchResult = {
  fetched: number;
  created: number;
  updated: number;
  failed: number;
  lastProcessedId: string | null;
  failures: RecordFailure[];
};
