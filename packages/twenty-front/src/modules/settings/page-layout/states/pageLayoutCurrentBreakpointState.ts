import { createState } from 'twenty-ui/utilities';
import { type PageLayoutBreakpoint } from '../constants/PageLayoutBreakpoints';

export const pageLayoutCurrentBreakpointState =
  createState<PageLayoutBreakpoint>({
    key: 'pageLayoutCurrentBreakpointState',
    defaultValue: 'desktop',
  });
