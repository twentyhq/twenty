import { isWidgetConfigurationOfType } from '@/side-panel/pages/page-layout/utils/isWidgetConfigurationOfType';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { assertIsDefinedOrThrow, doNotTranslate } from 'twenty-shared/utils';
import { type AggregateChartConfiguration } from '~/generated-metadata/graphql';

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
      new Error(doNotTranslate('Widget objectMetadataId is required')),
    );

    if (
      !isWidgetConfigurationOfType(
        widget.configuration,
        'AggregateChartConfiguration',
      )
    ) {
      throw new Error(
        doNotTranslate(
          `Expected AggregateChartConfiguration but got ${widget.configuration?.__typename}`,
        ),
      );
    }
  };
