import { type Layouts } from 'react-grid-layout';
import { createState } from 'twenty-ui/utilities';

export type TabLayouts = Record<string, Layouts>;

export const pageLayoutCurrentLayoutsState = createState<TabLayouts>({
  key: 'pageLayoutCurrentLayoutsState',
  defaultValue: {},
});
