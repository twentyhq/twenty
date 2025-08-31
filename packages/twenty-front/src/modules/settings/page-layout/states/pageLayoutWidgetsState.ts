import { createState } from 'twenty-ui/utilities';
import { type Widget } from '../mocks/mockWidgets';

export const pageLayoutWidgetsState = createState<Widget[]>({
  key: 'pageLayoutWidgetsState',
  defaultValue: [],
});
