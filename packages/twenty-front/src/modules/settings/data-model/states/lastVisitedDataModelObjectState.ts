import { createState } from 'twenty-ui/utilities';

export const lastVisitedDataModelObjectState = createState<string | null>({
  key: 'lastVisitedDataModelObjectState',
  defaultValue: null,
}); 