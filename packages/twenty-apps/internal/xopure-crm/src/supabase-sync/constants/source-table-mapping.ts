import type {
  SupportedSourceTable,
  TargetObjectName,
} from '../types/mapped-source-record.type';

export type SourceTableMapping = {
  sourceTable: SupportedSourceTable;
  targetObject: TargetObjectName;
  externalIdField: string;
  pluralApiName: string;
  createMutationName: string;
  updateMutationName: string;
};

export const SOURCE_TABLE_MAPPINGS: Record<
  SupportedSourceTable,
  SourceTableMapping
> = {
  profiles: {
    sourceTable: 'profiles',
    targetObject: 'person',
    externalIdField: 'xopureSupabasePersonId',
    pluralApiName: 'people',
    createMutationName: 'createPerson',
    updateMutationName: 'updatePerson',
  },
  customer_expertise: {
    sourceTable: 'customer_expertise',
    targetObject: 'xopureCustomer',
    externalIdField: 'supabaseCustomerId',
    pluralApiName: 'xopureCustomers',
    createMutationName: 'createXopureCustomer',
    updateMutationName: 'updateXopureCustomer',
  },
  affiliates: {
    sourceTable: 'affiliates',
    targetObject: 'xopureAmbassador',
    externalIdField: 'supabaseAmbassadorId',
    pluralApiName: 'xopureAmbassadors',
    createMutationName: 'createXopureAmbassador',
    updateMutationName: 'updateXopureAmbassador',
  },
  products: {
    sourceTable: 'products',
    targetObject: 'xopureProduct',
    externalIdField: 'supabaseProductId',
    pluralApiName: 'xopureProducts',
    createMutationName: 'createXopureProduct',
    updateMutationName: 'updateXopureProduct',
  },
  orders: {
    sourceTable: 'orders',
    targetObject: 'xopureOrder',
    externalIdField: 'supabaseOrderId',
    pluralApiName: 'xopureOrders',
    createMutationName: 'createXopureOrder',
    updateMutationName: 'updateXopureOrder',
  },
  order_items: {
    sourceTable: 'order_items',
    targetObject: 'xopureOrderLine',
    externalIdField: 'supabaseOrderItemId',
    pluralApiName: 'xopureOrderLines',
    createMutationName: 'createXopureOrderLine',
    updateMutationName: 'updateXopureOrderLine',
  },
  commission_ledger: {
    sourceTable: 'commission_ledger',
    targetObject: 'xopureCommission',
    externalIdField: 'supabaseCommissionId',
    pluralApiName: 'xopureCommissions',
    createMutationName: 'createXopureCommission',
    updateMutationName: 'updateXopureCommission',
  },
  payments: {
    sourceTable: 'payments',
    targetObject: 'xopurePayment',
    externalIdField: 'supabasePaymentId',
    pluralApiName: 'xopurePayments',
    createMutationName: 'createXopurePayment',
    updateMutationName: 'updateXopurePayment',
  },
};

export const TABLE_ALIASES: Record<string, SupportedSourceTable> = {
  order: 'orders',
  product: 'products',
  ambassador: 'affiliates',
  commission: 'commission_ledger',
  order_item: 'order_items',
  customer: 'customer_expertise',
  profile: 'profiles',
  payment: 'payments',
};

export const getSourceTableMapping = (
  sourceTable: string,
): SourceTableMapping | null => {
  if (sourceTable in SOURCE_TABLE_MAPPINGS) {
    return SOURCE_TABLE_MAPPINGS[sourceTable as SupportedSourceTable];
  }

  const alias = TABLE_ALIASES[sourceTable];
  if (alias) {
    return SOURCE_TABLE_MAPPINGS[alias];
  }

  return null;
};
