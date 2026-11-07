import { createContext } from 'react';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';

// ANDed into every query of the record index below it, without touching its
// record filter states, which the widget editor persists into the view
export const RecordIndexDashboardFilterContext =
  createContext<RecordGqlOperationFilter>({});
