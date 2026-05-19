export type SupportedSourceTable =
  | 'profiles'
  | 'customer_expertise'
  | 'affiliates'
  | 'products'
  | 'orders'
  | 'payments'
  | 'order_items'
  | 'commission_ledger';

export type TargetObjectName =
  | 'person'
  | 'xopureAmbassador'
  | 'xopureCustomer'
  | 'xopureProduct'
  | 'xopureOrder'
  | 'xopurePayment'
  | 'xopureOrderLine'
  | 'xopureCommission';

export type SyncStatus = 'SYNCED' | 'FAILED_RETRYABLE' | 'FAILED_PERMANENT';

export type RelationReference = {
  fieldName: string;
  relationIdFieldName: string;
  targetObject: TargetObjectName;
  externalIdField: string;
  externalIdValue: string;
  required: boolean;
};

export type MappedSourceRecord = {
  sourceSystem: 'supabase';
  sourceSchema: string;
  sourceTable: SupportedSourceTable;
  sourceRecordId: string;
  syncKey: string;
  targetObject: TargetObjectName;
  externalIdField: string;
  externalIdValue: string;
  fieldValues: Record<string, unknown>;
  relations: RelationReference[];
  contentHash: string;
};

export type MappingErrorCode =
  | 'UNSUPPORTED_SOURCE_TABLE'
  | 'MISSING_SOURCE_ID'
  | 'MALFORMED_RECORD';

export type MappingError = {
  ok: false;
  code: MappingErrorCode;
  message: string;
  retryable: false;
  sourceTable: string;
  sourceRecordId: string | null;
};

export type MappingSuccess = {
  ok: true;
  record: MappedSourceRecord;
};

export type MappingResult = MappingSuccess | MappingError;

export type SourceIdentity = {
  sourceSystem: 'supabase';
  sourceSchema: string;
  sourceTable: string;
  sourceRecordId: string;
};

export type UpsertAction = 'created' | 'updated' | 'skipped' | 'failed';

export type UpsertResult = {
  action: UpsertAction;
  targetObject: TargetObjectName;
  twentyRecordId?: string;
  syncMapId?: string;
  retryable?: boolean;
  errorCode?: string;
  errorMessage?: string;
};
