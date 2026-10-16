import { isWidgetConfigurationOfType } from '@/side-panel/pages/page-layout/utils/isWidgetConfigurationOfType';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';
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
      // oxlint-disable-next-line lingui/no-unlocalized-strings -- This message describes a developer-only invariant; keeping it stable preserves error reporting fingerprints.
      new Error('Widget objectMetadataId is required'),
    );

    if (
      !isWidgetConfigurationOfType(
        widget.configuration,
        'AggregateChartConfiguration',
      )
    ) {
      throw new Error(
        // oxlint-disable-next-line lingui/no-unlocalized-strings -- This message describes a developer-only invariant; keeping it stable preserves error reporting fingerprints.
        `Expected AggregateChartConfiguration but got ${widget.configuration?.__typename}`,
      );
    }
  };
