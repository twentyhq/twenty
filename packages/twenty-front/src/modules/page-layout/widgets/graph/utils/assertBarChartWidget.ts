import { isWidgetConfigurationOfType } from '@/command-menu/pages/page-layout/utils/isWidgetConfigurationOfType';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';
import { type BarChartConfiguration } from '~/generated/graphql';

type AssertBarChartWidgetOrThrow = (
  widget: PageLayoutWidget,
) => asserts widget is PageLayoutWidget & {
  objectMetadataId: string;
  configuration: BarChartConfiguration;
};

export const assertBarChartWidgetOrThrow: AssertBarChartWidgetOrThrow = (
  widget: PageLayoutWidget,
) => {
  assertIsDefinedOrThrow(
    widget.objectMetadataId,
    new Error('Widget objectMetadataId is required'),
  );

  if (
    !isWidgetConfigurationOfType(widget.configuration, 'BarChartConfiguration')
  ) {
    throw new Error(
      `Expected BarChartConfiguration but got ${widget.configuration?.__typename}`,
    );
  }
};
