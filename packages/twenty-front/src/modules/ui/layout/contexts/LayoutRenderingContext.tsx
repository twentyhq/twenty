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

  // Type of layout being rendered - aligns with backend PageLayoutType
  layoutType: 'RECORD_PAGE' | 'DASHBOARD' | 'RECORD_INDEX';

  // Whether the layout is rendered in a right drawer (affects UI behavior)
  isInRightDrawer: boolean;
};

export const [LayoutRenderingProvider, useLayoutRenderingContext] =
  createRequiredContext<LayoutRenderingContextType>('LayoutRenderingContext');

// Helper hook for record page cards that require a targetRecord
// This should only be used in components that are exclusively rendered on record pages
export const useTargetRecord = () => {
  const { targetRecord } = useLayoutRenderingContext();

  if (!targetRecord) {
    throw new Error(
      'useTargetRecord must be used within a record page context (targetRecord is required)',
    );
  }

  return targetRecord;
};
