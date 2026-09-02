import { type TabPresentation } from '@/page-layout/types/TabPresentation';
import { PageLayoutTabLayoutMode } from '~/generated-metadata/graphql';

type ShouldUseSoloCanvasContentPaddingParams = {
  presentation: TabPresentation;
  layoutMode: PageLayoutTabLayoutMode;
};

export const shouldUseSoloCanvasContentPadding = ({
  presentation,
  layoutMode,
}: ShouldUseSoloCanvasContentPaddingParams): boolean => {
  return (
    presentation === 'solo' && layoutMode === PageLayoutTabLayoutMode.CANVAS
  );
};
