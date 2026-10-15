import { type FlatPageLayoutWidget } from '@/metadata-store/types/FlatPageLayoutWidget';
import { PAGE_LAYOUT_WIDGET_POSITION_TYPENAME_BY_LAYOUT_MODE } from '@/page-layout/constants/PageLayoutWidgetPositionTypenameByLayoutMode';
import { WIDGET_CONFIGURATION_TYPENAME_BY_CONFIGURATION_TYPE } from '@/page-layout/constants/WidgetConfigurationTypenameByConfigurationType';
import { isDefined } from 'twenty-shared/utils';
import { type PageLayoutWidgetPosition } from '~/generated-metadata/graphql';

export const addTypenamesToFlatPageLayoutWidget = (
  flatPageLayoutWidget: FlatPageLayoutWidget,
): FlatPageLayoutWidget => {
  const { configuration, position } = flatPageLayoutWidget;

  const isConfigurationTyped =
    !isDefined(configuration) || isDefined(configuration.__typename);
  const isPositionTyped =
    !isDefined(position) || isDefined(position.__typename);

  if (isConfigurationTyped && isPositionTyped) {
    return flatPageLayoutWidget;
  }

  return {
    ...flatPageLayoutWidget,
    __typename: 'PageLayoutWidget',
    configuration: isConfigurationTyped
      ? configuration
      : ({
          ...configuration,
          __typename:
            WIDGET_CONFIGURATION_TYPENAME_BY_CONFIGURATION_TYPE[
              configuration.configurationType
            ],
        } as FlatPageLayoutWidget['configuration']),
    position: isPositionTyped
      ? position
      : ({
          ...position,
          __typename:
            PAGE_LAYOUT_WIDGET_POSITION_TYPENAME_BY_LAYOUT_MODE[
              position.layoutMode
            ],
        } as PageLayoutWidgetPosition),
  };
};
