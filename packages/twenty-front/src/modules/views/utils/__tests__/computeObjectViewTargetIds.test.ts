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
const initialView = makeView('view-initial', 1, null);
const userView = makeView('view-user', 7, null);
const widgetView = makeView('view-widget', 2, null, ViewType.FIELDS_WIDGET);
const tableWidgetView = makeView(
  'view-table-widget',
  0,
  null,
  ViewType.TABLE_WIDGET,
);

describe('computeObjectViewTargetIds', () => {
  it('should not resolve an initial view when the flag is off', () => {
    const result = computeObjectViewTargetIds({
      views: [indexView, initialView],
      objectMetadataId: 'metadata-1',
      isInitialObjectViewEnabled: false,
    });

    expect(result.initialObjectViewId).toBeUndefined();
    expect(result.indexViewId).toBe('view-index');
  });

  it('should resolve the lowest-positioned non-index view regardless of array order', () => {
    const result = computeObjectViewTargetIds({
      views: [userView, indexView, initialView],
      objectMetadataId: 'metadata-1',
      isInitialObjectViewEnabled: true,
    });

    expect(result.initialObjectViewId).toBe('view-initial');
    expect(result.indexViewId).toBe('view-index');
    expect(result.firstAvailableViewId).toBe('view-index');
  });

  it('should ignore fields widget views', () => {
    const result = computeObjectViewTargetIds({
      views: [indexView, widgetView],
      objectMetadataId: 'metadata-1',
      isInitialObjectViewEnabled: true,
    });

    expect(result.initialObjectViewId).toBeUndefined();
  });

  it('should ignore views belonging to another object', () => {
    const result = computeObjectViewTargetIds({
      views: [indexView, initialView],
      objectMetadataId: 'metadata-2',
      isInitialObjectViewEnabled: true,
    });

    expect(result.indexViewId).toBeUndefined();
    expect(result.firstAvailableViewId).toBeUndefined();
  });

  it('should never resolve a widget view, whatever its type', () => {
    const result = computeObjectViewTargetIds({
      views: [tableWidgetView, widgetView, indexView, initialView],
      objectMetadataId: 'metadata-1',
      isInitialObjectViewEnabled: true,
    });

    expect(result.initialObjectViewId).toBe('view-initial');
    expect(result.firstAvailableViewId).toBe('view-index');
  });
});
