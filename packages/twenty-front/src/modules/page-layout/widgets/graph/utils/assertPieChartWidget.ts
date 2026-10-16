import { isWidgetConfigurationOfType } from '@/side-panel/pages/page-layout/utils/isWidgetConfigurationOfType';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';
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
    new Error(doNotTranslate('Widget objectMetadataId is required')),
  );

  if (
    !isWidgetConfigurationOfType(widget.configuration, 'PieChartConfiguration')
  ) {
    throw new Error(
      doNotTranslate(
        `Expected PieChartConfiguration but got ${widget.configuration?.__typename}`,
      ),
    );
  }
};
