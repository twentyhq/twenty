import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { isWidgetEnabledByFeatureFlags } from '@/page-layout/utils/isWidgetEnabledByFeatureFlags';
import { PageLayoutTabLayoutMode } from '~/generated-metadata/graphql';

type GetIsSingleWidgetTabParams = {
  tab: Pick<PageLayoutTab, 'layoutMode' | 'widgets'>;
  featureFlags: Record<string, boolean>;
};

export const getIsSingleWidgetTab = ({
  tab,
  featureFlags,
}: GetIsSingleWidgetTabParams): boolean =>
  tab.layoutMode !== PageLayoutTabLayoutMode.GRID &&
  tab.widgets.filter(
    (widget) =>
      widget.isActive &&
      isWidgetEnabledByFeatureFlags({ widget, featureFlags }),
  ).length === 1;
