import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { getWidgetConfigurationViewId } from '@/page-layout/utils/getWidgetConfigurationViewId';
import { WidgetConfigurationType } from '~/generated-metadata/graphql';

describe('getWidgetConfigurationViewId', () => {
  it('should return viewId when present and is a string', () => {
    const configuration: PageLayoutWidget['configuration'] = {
      __typename: 'RecordTableConfiguration',
      configurationType: WidgetConfigurationType.RECORD_TABLE,
      viewId: 'view-123',
    };

    expect(getWidgetConfigurationViewId(configuration)).toBe('view-123');
  });

  it('should return null when viewId is not present', () => {
    const configuration: PageLayoutWidget['configuration'] = {
      __typename: 'IframeConfiguration',
      configurationType: WidgetConfigurationType.IFRAME,
      url: 'https://example.com',
    };

    expect(getWidgetConfigurationViewId(configuration)).toBeNull();
  });

  it('should return null when viewId is null', () => {
    const configuration: PageLayoutWidget['configuration'] = {
      __typename: 'RecordTableConfiguration',
      configurationType: WidgetConfigurationType.RECORD_TABLE,
      viewId: null,
    };

    expect(getWidgetConfigurationViewId(configuration)).toBeNull();
  });

  it('should return null when viewId is an empty string', () => {
    const configuration: PageLayoutWidget['configuration'] = {
      __typename: 'RecordTableConfiguration',
      configurationType: WidgetConfigurationType.RECORD_TABLE,
      viewId: '',
    };

    expect(getWidgetConfigurationViewId(configuration)).toBeNull();
  });
});
