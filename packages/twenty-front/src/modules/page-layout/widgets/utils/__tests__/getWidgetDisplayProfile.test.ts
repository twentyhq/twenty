import { getWidgetDisplayProfile } from '@/page-layout/widgets/utils/getWidgetDisplayProfile';
import { WidgetType } from '~/generated-metadata/graphql';

describe('getWidgetDisplayProfile', () => {
  it('treats activity widgets as flowing modules', () => {
    expect(getWidgetDisplayProfile(WidgetType.TASKS)).toEqual({
      affinity: 'module',
      scrollStrategy: 'flow',
    });
    expect(getWidgetDisplayProfile(WidgetType.EMAILS)).toEqual({
      affinity: 'module',
      scrollStrategy: 'flow',
    });
  });

  it('treats field and chart widgets as cards', () => {
    expect(getWidgetDisplayProfile(WidgetType.FIELDS).affinity).toBe('card');
    expect(getWidgetDisplayProfile(WidgetType.GRAPH).affinity).toBe('card');
  });

  it('treats viewport-filling widgets as fill modules', () => {
    expect(getWidgetDisplayProfile(WidgetType.RECORD_TABLE)).toEqual({
      affinity: 'module',
      scrollStrategy: 'fill',
    });
    expect(getWidgetDisplayProfile(WidgetType.WORKFLOW)).toEqual({
      affinity: 'module',
      scrollStrategy: 'fill',
    });
  });
});
