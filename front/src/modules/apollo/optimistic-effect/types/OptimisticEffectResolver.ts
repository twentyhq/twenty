import { OperationVariables } from '@apollo/client';

export type OptimisticEffectResolver<T> = ({
  currentData,
  newData,
  variables,
}: {
  currentData: T[];
  newData: T[];
  variables: OperationVariables;
}) => void;
