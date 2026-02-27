import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { isFieldWidget } from '@/page-layout/widgets/field/utils/isFieldWidget';
import {
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';

describe('isFieldWidget', () => {
  it('should return true for a FIELD widget with FieldConfiguration', () => {
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

    expect(isFieldWidget(widget)).toBe(true);
  });

  it('should return false for a non-FIELD widget type', () => {
    const widget = {
      id: 'w1',
      type: WidgetType.FIELDS,
      configuration: {
        __typename: 'FieldConfiguration',
        configurationType: WidgetConfigurationType.FIELD,
        fieldMetadataId: 'fm-1',
        layout: 'FIELD',
      },
    } as PageLayoutWidget;

    expect(isFieldWidget(widget)).toBe(false);
  });

  it('should return false when configuration is null', () => {
    const widget = {
      id: 'w1',
      type: WidgetType.FIELD,
      configuration: null,
    } as unknown as PageLayoutWidget;

    expect(isFieldWidget(widget)).toBe(false);
  });

  it('should return false when configuration typename does not match', () => {
    const widget = {
      id: 'w1',
      type: WidgetType.FIELD,
      configuration: {
        __typename: 'WidgetConfiguration',
      },
    } as unknown as PageLayoutWidget;

    expect(isFieldWidget(widget)).toBe(false);
  });
});
