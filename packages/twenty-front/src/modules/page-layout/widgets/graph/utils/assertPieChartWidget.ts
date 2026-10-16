import { isWidgetConfigurationOfType } from '@/side-panel/pages/page-layout/utils/isWidgetConfigurationOfType';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';
import { type PieChartConfiguration } from '~/generated-metadata/graphql';

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
    // oxlint-disable-next-line lingui/no-unlocalized-strings -- This message describes a developer-only invariant; keeping it stable preserves error reporting fingerprints.
    new Error('Widget objectMetadataId is required'),
  );

  if (
    !isWidgetConfigurationOfType(widget.configuration, 'PieChartConfiguration')
  ) {
    throw new Error(
      // oxlint-disable-next-line lingui/no-unlocalized-strings -- This message describes a developer-only invariant; keeping it stable preserves error reporting fingerprints.
      `Expected PieChartConfiguration but got ${widget.configuration?.__typename}`,
    );
  }
};
