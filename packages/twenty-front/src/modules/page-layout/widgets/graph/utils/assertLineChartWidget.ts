import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';
import { type LineChartConfiguration } from '~/generated/graphql';

type AssertLineChartWidgetOrThrow = (
  widget: PageLayoutWidget,
) => asserts widget is PageLayoutWidget & {
  objectMetadataId: string;
  configuration: LineChartConfiguration;
};

export const assertLineChartWidgetOrThrow: AssertLineChartWidgetOrThrow = (
  widget: PageLayoutWidget,
) => {
  assertIsDefinedOrThrow(
    widget.objectMetadataId,
    new Error('Widget objectMetadataId is required'),
  );

  if (widget.configuration?.__typename !== 'LineChartConfiguration') {
    throw new Error(
      `Expected LineChartConfiguration but got ${widget.configuration?.__typename}`,
    );
  }
};
