import { type TabPresentation } from '@/page-layout/types/TabPresentation';
import { PageLayoutType } from '~/generated-metadata/graphql';

type IsFullPageWidgetParams = {
  pageLayoutType: PageLayoutType | null;
  presentation: TabPresentation;
};

export const isFullPageWidget = ({
  pageLayoutType,
  presentation,
}: IsFullPageWidgetParams): boolean =>
  pageLayoutType === PageLayoutType.STANDALONE_PAGE && presentation === 'solo';
