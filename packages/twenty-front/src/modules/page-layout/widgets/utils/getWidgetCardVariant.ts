import { type TabPresentation } from '@/page-layout/types/TabPresentation';
import { type WidgetCardVariant } from '@/page-layout/widgets/types/WidgetCardVariant';
import { isSoloStandaloneFrontComponent } from '@/page-layout/widgets/utils/isSoloStandaloneFrontComponent';
import { PageLayoutType, type WidgetType } from '~/generated-metadata/graphql';

type GetWidgetCardVariantParams = {
  isSideColumnContext: boolean;
  pageLayoutType: PageLayoutType | null;
  presentation: TabPresentation;
  widgetType: WidgetType;
};

export const getWidgetCardVariant = ({
  isSideColumnContext,
  pageLayoutType,
  presentation,
  widgetType,
}: GetWidgetCardVariantParams): WidgetCardVariant => {
  if (
    isSideColumnContext ||
    isSoloStandaloneFrontComponent({
      pageLayoutType,
      presentation,
      widgetType,
    })
  ) {
    return 'flush';
  }

  switch (pageLayoutType) {
    case PageLayoutType.DASHBOARD:
    case PageLayoutType.STANDALONE_PAGE:
      return 'framed';
    case PageLayoutType.RECORD_PAGE:
    case PageLayoutType.RECORD_INDEX:
    case PageLayoutType.RECORD_FORM:
    case null:
      return 'flush';
  }
};
