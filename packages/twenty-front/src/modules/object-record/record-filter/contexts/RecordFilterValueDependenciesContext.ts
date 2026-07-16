import { createContext } from 'react';
import {
  type RecordFilterValueDependencies,
  type RecordGqlOperationFilter,
} from 'twenty-shared/types';

export type RecordFilterValueDependenciesContextValue = Pick<
  RecordFilterValueDependencies,
  'currentRecord'
> & {
  relationTableFilter?: RecordGqlOperationFilter;
};

export const RecordFilterValueDependenciesContext =
  createContext<RecordFilterValueDependenciesContextValue>({});
