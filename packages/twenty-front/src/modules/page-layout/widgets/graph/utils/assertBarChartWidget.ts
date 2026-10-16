import { isWidgetConfigurationOfType } from '@/side-panel/pages/page-layout/utils/isWidgetConfigurationOfType';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';
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
    new Error(doNotTranslate('Widget objectMetadataId is required')),
  );

  if (
    !isWidgetConfigurationOfType(widget.configuration, 'BarChartConfiguration')
  ) {
    throw new Error(
      doNotTranslate(
        `Expected BarChartConfiguration but got ${widget.configuration?.__typename}`,
      ),
    );
  }
};
