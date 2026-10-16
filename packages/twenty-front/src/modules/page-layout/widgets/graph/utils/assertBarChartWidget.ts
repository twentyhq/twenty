import { isWidgetConfigurationOfType } from '@/side-panel/pages/page-layout/utils/isWidgetConfigurationOfType';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';
import { type BarChartConfiguration } from '~/generated-metadata/graphql';

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
    // oxlint-disable-next-line lingui/no-unlocalized-strings -- This message describes a developer-only invariant; keeping it stable preserves error reporting fingerprints.
    new Error('Widget objectMetadataId is required'),
  );

  if (
    !isWidgetConfigurationOfType(widget.configuration, 'BarChartConfiguration')
  ) {
    throw new Error(
      // oxlint-disable-next-line lingui/no-unlocalized-strings -- This message describes a developer-only invariant; keeping it stable preserves error reporting fingerprints.
      `Expected BarChartConfiguration but got ${widget.configuration?.__typename}`,
    );
  }
};
