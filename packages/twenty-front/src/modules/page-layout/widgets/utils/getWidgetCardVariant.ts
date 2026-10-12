import { PageLayoutType } from '~/generated-metadata/graphql';
import { type WidgetCardVariant } from '@/page-layout/widgets/types/WidgetCardVariant';

type GetWidgetCardVariantParams = {
  isSideColumnContext: boolean;
  isSoloFrontComponent: boolean;
  pageLayoutType: PageLayoutType | null;
};

export const getWidgetCardVariant = ({
  isSideColumnContext,
  isSoloFrontComponent,
  pageLayoutType,
}: GetWidgetCardVariantParams): WidgetCardVariant => {
  if (isSideColumnContext) {
    return 'flush';
  }

  switch (pageLayoutType) {
    case PageLayoutType.DASHBOARD:
      return 'framed';
    case PageLayoutType.STANDALONE_PAGE:
      return isSoloFrontComponent ? 'flush' : 'framed';
    case PageLayoutType.RECORD_PAGE:
    case PageLayoutType.RECORD_INDEX:
    case PageLayoutType.RECORD_FORM:
    case null:
      return 'flush';
  }
};
