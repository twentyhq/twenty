import { type PageLayoutType } from '~/generated/graphql';
import { createRequiredContext } from '~/utils/createRequiredContext';
import { type TargetRecordIdentifier } from './TargetRecordIdentifier';

export type LayoutRenderingContextType = {
  // Optional target record - only present for record pages that display data about a specific record
  // Undefined for dashboards which are standalone
  // Uses ActivityTargetableObject shape for compatibility with existing components
  targetRecordIdentifier: TargetRecordIdentifier | undefined;

  layoutType: PageLayoutType;

  isInRightDrawer: boolean;
};

export const [LayoutRenderingProvider, useLayoutRenderingContext] =
  createRequiredContext<LayoutRenderingContextType>('LayoutRenderingContext');
