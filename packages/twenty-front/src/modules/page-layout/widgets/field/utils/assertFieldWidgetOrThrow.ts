import { type FieldConfiguration } from '@/page-layout/types/FieldConfiguration';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';
import { WidgetConfigurationType } from '~/generated-metadata/graphql';

type AssertFieldWidgetOrThrow = (
  widget: PageLayoutWidget,
) => asserts widget is PageLayoutWidget & {
  configuration: FieldConfiguration;
};

export const assertFieldWidgetOrThrow: AssertFieldWidgetOrThrow = (
  widget: PageLayoutWidget,
) => {
  assertIsDefinedOrThrow(
    widget.configuration,
    new Error(doNotTranslate('Widget configuration is required')),
  );

  if (
    widget.configuration.configurationType !== WidgetConfigurationType.FIELD
  ) {
    throw new Error(
      doNotTranslate(
        `Expected FieldConfiguration but got ${widget.configuration.__typename}`,
      ),
    );
  }
};
