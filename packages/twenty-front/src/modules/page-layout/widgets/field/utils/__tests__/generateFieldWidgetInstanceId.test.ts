import { generateFieldWidgetInstanceId } from '@/page-layout/widgets/field/utils/generateFieldWidgetInstanceId';

describe('generateFieldWidgetInstanceId', () => {
  it('should generate an instance id without side panel suffix', () => {
    const result = generateFieldWidgetInstanceId({
      widgetId: 'widget-1',
      recordId: 'record-1',
      fieldName: 'name',
      isInSidePanel: false,
    });

    expect(result).toBe('widget-1-field-widget-record-1-name');
  });

  it('should append side panel suffix when isInSidePanel is true', () => {
    const result = generateFieldWidgetInstanceId({
      widgetId: 'widget-1',
      recordId: 'record-1',
      fieldName: 'name',
      isInSidePanel: true,
    });

    expect(result).toBe('widget-1-field-widget-record-1-name-side-panel');
  });
});
