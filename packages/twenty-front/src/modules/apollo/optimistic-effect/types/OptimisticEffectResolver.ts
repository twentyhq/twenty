import { OperationVariables } from '@apollo/client';

export type OptimisticEffectResolver = ({
  currentCacheData,
  createdRecords,
  updatedRecords,
  deletedRecordIds,
  variables,
}: {
  currentCacheData: any; //TODO: Change when decommissioning v1
  createdRecords?: Record<string, unknown>[];
  updatedRecords?: Record<string, unknown>[];
  deletedRecordIds?: string[];
  variables: OperationVariables;
}) => void;
