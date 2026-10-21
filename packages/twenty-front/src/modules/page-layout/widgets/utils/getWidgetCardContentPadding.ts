import { type TabPresentation } from '@/page-layout/types/TabPresentation';
import { type WidgetCardVariant } from '@/page-layout/widgets/types/WidgetCardVariant';
import {
  getWidgetContentPadding,
  type WidgetContentPadding,
} from '@/page-layout/widgets/utils/getWidgetContentPadding';
import { isFullPageWidget } from '@/page-layout/widgets/utils/isFullPageWidget';
import { isWidgetCardFlushInViewMode } from '@/page-layout/widgets/utils/isWidgetCardFlushInViewMode';
import { type PageLayoutType, WidgetType } from '~/generated-metadata/graphql';

type GetWidgetCardContentPaddingParams = {
  isEditable: boolean;
  pageLayoutType: PageLayoutType | null;
  presentation: TabPresentation;
  variant: WidgetCardVariant;
  widgetType: WidgetType;
};

export const getWidgetCardContentPadding = ({
  isEditable,
  pageLayoutType,
  presentation,
  variant,
  widgetType,
}: GetWidgetCardContentPaddingParams): WidgetContentPadding => {
  if (
    widgetType === WidgetType.FRONT_COMPONENT &&
    isFullPageWidget({ pageLayoutType, presentation })
  ) {
    return 'none';
  }

  if (!isWidgetCardFlushInViewMode({ isEditable, variant })) {
    return 'default';
  }

  return getWidgetContentPadding(widgetType);
};
