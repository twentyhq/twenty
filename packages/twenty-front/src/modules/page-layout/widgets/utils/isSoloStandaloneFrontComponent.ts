import { type TabPresentation } from '@/page-layout/types/TabPresentation';
import { PageLayoutType, WidgetType } from '~/generated-metadata/graphql';

type IsSoloStandaloneFrontComponentParams = {
  pageLayoutType: PageLayoutType | null;
  presentation: TabPresentation;
  widgetType: WidgetType;
};

export const isSoloStandaloneFrontComponent = ({
  pageLayoutType,
  presentation,
  widgetType,
}: IsSoloStandaloneFrontComponentParams): boolean =>
  pageLayoutType === PageLayoutType.STANDALONE_PAGE &&
  presentation === 'solo' &&
  widgetType === WidgetType.FRONT_COMPONENT;
