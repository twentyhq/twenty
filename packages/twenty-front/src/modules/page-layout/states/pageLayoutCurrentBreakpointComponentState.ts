import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';
import { type PageLayoutBreakpoint } from '@/page-layout/constants/PageLayoutBreakpoints';

import { PageLayoutComponentInstanceContext } from './contexts/PageLayoutComponentInstanceContext';

export const pageLayoutCurrentBreakpointComponentState =
  createComponentState<PageLayoutBreakpoint>({
    key: 'pageLayoutCurrentBreakpointComponentState',
    defaultValue: 'desktop',
    componentInstanceContext: PageLayoutComponentInstanceContext,
  });
