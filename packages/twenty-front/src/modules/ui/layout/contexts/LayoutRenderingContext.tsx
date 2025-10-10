import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { createRequiredContext } from '~/utils/createRequiredContext';

export type LayoutRenderingContextType = {
  // Optional target record - only present for record pages that display data about a specific record
  // Undefined for dashboards which are standalone
  // Uses ActivityTargetableObject shape for compatibility with existing components
  targetRecord?: Pick<
    ActivityTargetableObject,
    'id' | 'targetObjectNameSingular'
  >;

  layoutType: 'RECORD_PAGE' | 'DASHBOARD' | 'RECORD_INDEX';

  isInRightDrawer: boolean;
};

export const [LayoutRenderingProvider, useLayoutRenderingContext] =
  createRequiredContext<LayoutRenderingContextType>('LayoutRenderingContext');
