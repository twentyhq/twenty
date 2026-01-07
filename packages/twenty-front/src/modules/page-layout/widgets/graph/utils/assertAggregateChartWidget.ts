import { isWidgetConfigurationOfType } from '@/command-menu/pages/page-layout/utils/isWidgetConfigurationOfType';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';
import { type AggregateChartConfiguration } from '~/generated/graphql';

type AssertAggregateChartWidgetOrThrow = (
  widget: PageLayoutWidget,
) => asserts widget is PageLayoutWidget & {
  objectMetadataId: string;
  configuration: AggregateChartConfiguration;
};

export const assertAggregateChartWidgetOrThrow: AssertAggregateChartWidgetOrThrow =
  (widget: PageLayoutWidget) => {
    assertIsDefinedOrThrow(
      widget.objectMetadataId,
      new Error('Widget objectMetadataId is required'),
    );

    if (
      !isWidgetConfigurationOfType(
        widget.configuration,
        'AggregateChartConfiguration',
      )
    ) {
      throw new Error(
        `Expected AggregateChartConfiguration but got ${widget.configuration?.__typename}`,
      );
    }
  };
