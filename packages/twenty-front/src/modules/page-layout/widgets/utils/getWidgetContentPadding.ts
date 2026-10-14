import { type TabPresentation } from '@/page-layout/types/TabPresentation';
import { isSoloStandaloneFrontComponent } from '@/page-layout/widgets/utils/isSoloStandaloneFrontComponent';
import { type PageLayoutType, WidgetType } from '~/generated-metadata/graphql';

export type WidgetContentPadding = 'default' | 'none';

type GetWidgetContentPaddingParams = {
  pageLayoutType: PageLayoutType | null;
  presentation: TabPresentation;
  widgetType: WidgetType;
};

export const getWidgetContentPadding = ({
  pageLayoutType,
  presentation,
  widgetType,
}: GetWidgetContentPaddingParams): WidgetContentPadding => {
  if (
    isSoloStandaloneFrontComponent({
      pageLayoutType,
      presentation,
      widgetType,
    })
  ) {
    return 'none';
  }

  switch (widgetType) {
    case WidgetType.WORKFLOW:
    case WidgetType.WORKFLOW_RUN:
    case WidgetType.WORKFLOW_VERSION:
    case WidgetType.CHAT:
      return 'none';
    default:
      return 'default';
  }
};
