import { OverlayScrollbars } from 'overlayscrollbars';
import { createState } from 'twenty-ui';

export const overlayScrollbarsState = createState<OverlayScrollbars | null>({
  key: 'scroll/overlayScrollbarsState',
  defaultValue: null,
});
