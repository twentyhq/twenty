import { PageLayoutType } from '~/generated-metadata/graphql';
import { type WidgetCardVariant } from '~/modules/page-layout/widgets/types/WidgetCardVariant';

type GetWidgetCardVariantParams = {
  isSideColumnContext: boolean;
  pageLayoutType: PageLayoutType | null;
};

export const getWidgetCardVariant = ({
  isSideColumnContext,
  pageLayoutType,
}: GetWidgetCardVariantParams): WidgetCardVariant => {
  if (isSideColumnContext) {
    return 'flush';
  }

  switch (pageLayoutType) {
    case PageLayoutType.DASHBOARD:
    case PageLayoutType.STANDALONE_PAGE:
      return 'framed';
    case PageLayoutType.RECORD_PAGE:
    case PageLayoutType.RECORD_INDEX:
    case null:
      return 'flush';
  }
};
