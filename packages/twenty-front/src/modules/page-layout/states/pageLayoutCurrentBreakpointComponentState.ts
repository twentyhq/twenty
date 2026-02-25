import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { type PageLayoutBreakpoint } from '@/page-layout/constants/PageLayoutBreakpoints';

import { PageLayoutComponentInstanceContext } from './contexts/PageLayoutComponentInstanceContext';

export const pageLayoutCurrentBreakpointComponentState =
  createAtomComponentState<PageLayoutBreakpoint>({
    key: 'pageLayoutCurrentBreakpointComponentState',
    defaultValue: 'desktop',
    componentInstanceContext: PageLayoutComponentInstanceContext,
  });
