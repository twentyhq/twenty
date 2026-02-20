import { generateFieldWidgetInstanceId } from '@/page-layout/widgets/field/utils/generateFieldWidgetInstanceId';

describe('generateFieldWidgetInstanceId', () => {
  it('should generate an instance id without right drawer suffix', () => {
    const result = generateFieldWidgetInstanceId({
      widgetId: 'widget-1',
      recordId: 'record-1',
      fieldName: 'name',
      isInRightDrawer: false,
    });

    expect(result).toBe('widget-1-field-widget-record-1-name');
  });

  it('should append right drawer suffix when isInRightDrawer is true', () => {
    const result = generateFieldWidgetInstanceId({
      widgetId: 'widget-1',
      recordId: 'record-1',
      fieldName: 'name',
      isInRightDrawer: true,
    });

    expect(result).toBe('widget-1-field-widget-record-1-name-right-drawer');
  });
});
