import { type ChartConfiguration } from '@/side-panel/pages/page-layout/types/ChartConfiguration';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { isNonEmptyString } from '@sniptt/guards';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';

type AssertChartWidgetOrThrow = (
  widget: PageLayoutWidget,
) => asserts widget is PageLayoutWidget & {
  objectMetadataId: string;
  configuration: ChartConfiguration;
};

const VALID_CHART_TYPES: ReadonlyArray<ChartConfiguration['__typename']> = [
  'BarChartConfiguration',
  'LineChartConfiguration',
  'PieChartConfiguration',
  'AggregateChartConfiguration',
] as const;

export const assertChartWidgetOrThrow: AssertChartWidgetOrThrow = (
  widget: PageLayoutWidget,
) => {
  assertIsDefinedOrThrow(
    widget.objectMetadataId,
    new Error(doNotTranslate('Widget objectMetadataId is required')),
  );

  assertIsDefinedOrThrow(
    widget.configuration,
    new Error(doNotTranslate('Widget configuration is required')),
  );

  if (
    !isNonEmptyString(widget.configuration.__typename) ||
    !VALID_CHART_TYPES.includes(
      widget.configuration.__typename as ChartConfiguration['__typename'],
    )
  ) {
    throw new Error(
      doNotTranslate(
        `Expected chart configuration but got ${widget.configuration.__typename}`,
      ),
    );
  }
};
