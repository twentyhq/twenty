import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';
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
    new Error(doNotTranslate('Widget objectMetadataId is required')),
  );

  if (widget.configuration?.__typename !== 'LineChartConfiguration') {
    throw new Error(
      doNotTranslate(
        `Expected LineChartConfiguration but got ${widget.configuration?.__typename}`,
      ),
    );
  }
};
