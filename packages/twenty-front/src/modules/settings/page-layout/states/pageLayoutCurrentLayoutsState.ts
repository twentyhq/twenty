import { type Layouts } from 'react-grid-layout';
import { createState } from 'twenty-ui/utilities';

export const pageLayoutCurrentLayoutsState = createState<Layouts>({
  key: 'pageLayoutCurrentLayoutsState',
  defaultValue: { desktop: [], mobile: [] },
});
