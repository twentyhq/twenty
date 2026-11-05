import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { assertFieldWidgetOrThrow } from '@/page-layout/widgets/field/utils/assertFieldWidgetOrThrow';
import {
  FieldDisplayMode,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';

describe('assertFieldWidgetOrThrow', () => {
  it('should not throw for a valid field widget', () => {
    const widget = {
      id: 'w1',
      type: WidgetType.FIELD,
      configuration: {
        __typename: 'FieldConfiguration',
        configurationType: WidgetConfigurationType.FIELD,
        fieldMetadataId: 'fm-1',
        fieldDisplayMode: FieldDisplayMode.FIELD,
      },
    } as PageLayoutWidget;

    expect(() => assertFieldWidgetOrThrow(widget)).not.toThrow();
  });

  it('should throw when configuration typename does not match', () => {
    const widget: Pick<PageLayoutWidget, 'configuration'> = {
      configuration: {
        __typename: 'IframeConfiguration',
        configurationType: WidgetConfigurationType.IFRAME,
        url: 'https://example.com',
      },
    };

    expect(() => assertFieldWidgetOrThrow(widget)).toThrow(
      'Expected FieldConfiguration but got IframeConfiguration',
    );
  });
});
