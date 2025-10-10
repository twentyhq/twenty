import { type RecordGqlOperationSignature } from '@/object-record/graphql/types/RecordGqlOperationSignature';

export type RecordGqlOperationSignatureFactory<FactoryParams extends object> = (
  factoryParams: FactoryParams,
) => RecordGqlOperationSignature;
