import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { getWidgetConfigurationViewId } from '@/page-layout/utils/getWidgetConfigurationViewId';

describe('getWidgetConfigurationViewId', () => {
  it('should return viewId when present and is a string', () => {
    const configuration = {
      __typename: 'RecordTableConfiguration',
      configurationType: 'RECORD_TABLE',
      viewId: 'view-123',
    } as unknown as PageLayoutWidget['configuration'];

    expect(getWidgetConfigurationViewId(configuration)).toBe('view-123');
  });

  it('should return null when viewId is not present', () => {
    const configuration = {
      __typename: 'IframeConfiguration',
      configurationType: 'IFRAME',
      url: 'https://example.com',
    } as unknown as PageLayoutWidget['configuration'];

    expect(getWidgetConfigurationViewId(configuration)).toBeNull();
  });

  it('should return null when viewId is not a string', () => {
    const configuration = {
      __typename: 'RecordTableConfiguration',
      configurationType: 'RECORD_TABLE',
      viewId: 123,
    } as unknown as PageLayoutWidget['configuration'];

    expect(getWidgetConfigurationViewId(configuration)).toBeNull();
  });

  it('should return null when viewId is null', () => {
    const configuration = {
      __typename: 'RecordTableConfiguration',
      configurationType: 'RECORD_TABLE',
      viewId: null,
    } as unknown as PageLayoutWidget['configuration'];

    expect(getWidgetConfigurationViewId(configuration)).toBeNull();
  });
});
