import { OperationVariables } from '@apollo/client';

export type OptimisticEffectResolver = ({
  currentData,
  newData,
  variables,
}: {
  currentData: any; //TODO: Change when decommissioning v1
  newData: any; //TODO:   Change when decommissioning v1
  variables: OperationVariables;
}) => void;
