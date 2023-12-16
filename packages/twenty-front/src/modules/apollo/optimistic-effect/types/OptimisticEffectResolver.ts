import { OperationVariables } from '@apollo/client';

export type OptimisticEffectResolver = ({
  currentData,
  newData,
  updatedData,
  deletedRecordIds,
  variables,
}: {
  currentData: any; //TODO: Change when decommissioning v1
  newData?: any; //TODO:   Change when decommissioning v1
  updatedData?: any; //TODO: Change when decommissioning v1
  deletedRecordIds?: string[];
  variables: OperationVariables;
}) => void;
