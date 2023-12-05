import { OperationVariables } from '@apollo/client';

export type OptimisticEffectResolver = ({
  currentData,
  newData,
  deletedRecordIds,
  variables,
}: {
  currentData: any; //TODO: Change when decommissioning v1
  newData: any; //TODO:   Change when decommissioning v1
  deletedRecordIds?: string[];
  variables: OperationVariables;
}) => void;
