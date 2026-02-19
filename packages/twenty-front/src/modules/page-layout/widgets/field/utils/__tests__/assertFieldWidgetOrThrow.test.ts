import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { assertFieldWidgetOrThrow } from '@/page-layout/widgets/field/utils/assertFieldWidgetOrThrow';
import {
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
        layout: 'FIELD',
      },
    } as PageLayoutWidget;

    expect(() => assertFieldWidgetOrThrow(widget)).not.toThrow();
  });

  it('should throw when configuration is undefined', () => {
    const widget = {
      id: 'w1',
      type: WidgetType.FIELD,
      configuration: undefined,
    } as unknown as PageLayoutWidget;

    expect(() => assertFieldWidgetOrThrow(widget)).toThrow(
      'Widget configuration is required',
    );
  });

  it('should throw when configuration typename does not match', () => {
    const widget = {
      id: 'w1',
      type: WidgetType.FIELD,
      configuration: {
        __typename: 'WidgetConfiguration',
      },
    } as unknown as PageLayoutWidget;

    expect(() => assertFieldWidgetOrThrow(widget)).toThrow(
      'Expected FieldConfiguration but got WidgetConfiguration',
    );
  });

  it('should throw when configuration typename is empty string', () => {
    const widget = {
      id: 'w1',
      type: WidgetType.FIELD,
      configuration: {
        __typename: '',
      },
    } as unknown as PageLayoutWidget;

    expect(() => assertFieldWidgetOrThrow(widget)).toThrow();
  });
});
