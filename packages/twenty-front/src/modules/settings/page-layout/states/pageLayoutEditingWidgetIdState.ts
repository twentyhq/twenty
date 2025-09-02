import { createState } from 'twenty-ui/utilities';

export const pageLayoutEditingWidgetIdState = createState<string | null>({
  key: 'pageLayoutEditingWidgetIdState',
  defaultValue: null,
});
