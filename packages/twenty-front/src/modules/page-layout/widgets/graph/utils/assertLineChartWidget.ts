import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';
import { type LineChartConfiguration } from '~/generated-metadata/graphql';

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
    // oxlint-disable-next-line lingui/no-unlocalized-strings -- This message describes a developer-only invariant; keeping it stable preserves error reporting fingerprints.
    new Error('Widget objectMetadataId is required'),
  );

  if (widget.configuration?.__typename !== 'LineChartConfiguration') {
    throw new Error(
      // oxlint-disable-next-line lingui/no-unlocalized-strings -- This message describes a developer-only invariant; keeping it stable preserves error reporting fingerprints.
      `Expected LineChartConfiguration but got ${widget.configuration?.__typename}`,
    );
  }
};
