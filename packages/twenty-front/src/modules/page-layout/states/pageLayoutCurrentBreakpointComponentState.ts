import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';
import { type PageLayoutBreakpoint } from '@/page-layout/constants/PageLayoutBreakpoints';

import { PageLayoutComponentInstanceContext } from './contexts/PageLayoutComponentInstanceContext';

export const pageLayoutCurrentBreakpointComponentState =
  createComponentStateV2<PageLayoutBreakpoint>({
    key: 'pageLayoutCurrentBreakpointComponentState',
    defaultValue: 'desktop',
    componentInstanceContext: PageLayoutComponentInstanceContext,
  });
