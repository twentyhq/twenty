import { type FieldConfiguration } from '@/page-layout/types/FieldConfiguration';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { isNonEmptyString } from '@sniptt/guards';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';

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
    new Error('Widget configuration is required'),
  );

  if (
    !isNonEmptyString(widget.configuration.__typename) ||
    widget.configuration.__typename !== 'FieldConfiguration'
  ) {
    throw new Error(
      `Expected FieldConfiguration but got ${widget.configuration.__typename}`,
    );
  }
};
