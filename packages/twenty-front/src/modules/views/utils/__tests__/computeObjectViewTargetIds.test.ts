import { computeObjectViewTargetIds } from '@/views/utils/computeObjectViewTargetIds';
import { ViewKey, ViewType } from '~/generated-metadata/graphql';

const makeView = (
  id: string,
  position: number,
  key: ViewKey | null,
  type: ViewType = ViewType.TABLE,
) => ({
  id,
  objectMetadataId: 'metadata-1',
  key,
  type,
  position,
});

const indexView = makeView('view-index', 0, ViewKey.INDEX);
const firstSelectableView = makeView('view-first-selectable', 1, null);
const userView = makeView('view-user', 7, null);
const widgetView = makeView('view-widget', 2, null, ViewType.FIELDS_WIDGET);
const tableWidgetView = makeView(
  'view-table-widget',
  0,
  null,
  ViewType.TABLE_WIDGET,
);

describe('computeObjectViewTargetIds', () => {
  it('should not resolve a selectable view when the flag is off', () => {
    const result = computeObjectViewTargetIds({
      views: [indexView, firstSelectableView],
      objectMetadataId: 'metadata-1',
      isInitialObjectViewEnabled: false,
    });

    expect(result.firstSelectableViewId).toBeUndefined();
    expect(result.indexViewId).toBe('view-index');
  });

  it('should resolve the lowest-positioned non-index view regardless of array order', () => {
    const result = computeObjectViewTargetIds({
      views: [userView, indexView, firstSelectableView],
      objectMetadataId: 'metadata-1',
      isInitialObjectViewEnabled: true,
    });

    expect(result.firstSelectableViewId).toBe('view-first-selectable');
    expect(result.indexViewId).toBe('view-index');
    expect(result.firstAvailableViewId).toBe('view-index');
  });

  it('should ignore fields widget views', () => {
    const result = computeObjectViewTargetIds({
      views: [indexView, widgetView],
      objectMetadataId: 'metadata-1',
      isInitialObjectViewEnabled: true,
    });

    expect(result.firstSelectableViewId).toBeUndefined();
  });

  it('should ignore views belonging to another object', () => {
    const result = computeObjectViewTargetIds({
      views: [indexView, firstSelectableView],
      objectMetadataId: 'metadata-2',
      isInitialObjectViewEnabled: true,
    });

    expect(result.indexViewId).toBeUndefined();
    expect(result.firstAvailableViewId).toBeUndefined();
  });

  it('should never resolve a widget view, whatever its type', () => {
    const result = computeObjectViewTargetIds({
      views: [tableWidgetView, widgetView, indexView, firstSelectableView],
      objectMetadataId: 'metadata-1',
      isInitialObjectViewEnabled: true,
    });

    expect(result.firstSelectableViewId).toBe('view-first-selectable');
    expect(result.firstAvailableViewId).toBe('view-index');
  });
});
