import { isWidgetConfigurationOfType } from '@/command-menu/pages/page-layout/utils/isWidgetConfigurationOfType';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';
import { type PieChartConfiguration } from '~/generated/graphql';

type AssertPieChartWidgetOrThrow = (
  widget: PageLayoutWidget,
) => asserts widget is PageLayoutWidget & {
  objectMetadataId: string;
  configuration: PieChartConfiguration;
};

export const assertPieChartWidgetOrThrow: AssertPieChartWidgetOrThrow = (
  widget: PageLayoutWidget,
) => {
  assertIsDefinedOrThrow(
    widget.objectMetadataId,
    new Error('Widget objectMetadataId is required'),
  );

  if (
    !isWidgetConfigurationOfType(widget.configuration, 'PieChartConfiguration')
  ) {
    throw new Error(
      `Expected PieChartConfiguration but got ${widget.configuration?.__typename}`,
    );
  }
};
