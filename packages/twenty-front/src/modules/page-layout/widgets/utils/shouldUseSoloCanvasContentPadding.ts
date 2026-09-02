import { PageLayoutTabLayoutMode } from '~/generated-metadata/graphql';

type ShouldUseSoloCanvasContentPaddingParams = {
  presentation: string;
  layoutMode: PageLayoutTabLayoutMode;
};

export const shouldUseSoloCanvasContentPadding = ({
  presentation,
  layoutMode,
}: ShouldUseSoloCanvasContentPaddingParams): boolean =>
  presentation === 'solo' && layoutMode === PageLayoutTabLayoutMode.CANVAS;
