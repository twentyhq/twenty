import { PageLayoutType } from '~/generated-metadata/graphql';
import { type TabPresentation } from '@/page-layout/types/TabPresentation';
import { type WidgetCardVariant } from '@/page-layout/widgets/types/WidgetCardVariant';
import { isFullPageWidget } from '@/page-layout/widgets/utils/isFullPageWidget';

type GetWidgetCardVariantParams = {
  isSideColumnContext: boolean;
  pageLayoutType: PageLayoutType | null;
  presentation: TabPresentation;
};

export const getWidgetCardVariant = ({
  isSideColumnContext,
  pageLayoutType,
  presentation,
}: GetWidgetCardVariantParams): WidgetCardVariant => {
  if (
    isSideColumnContext ||
    isFullPageWidget({ pageLayoutType, presentation })
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
