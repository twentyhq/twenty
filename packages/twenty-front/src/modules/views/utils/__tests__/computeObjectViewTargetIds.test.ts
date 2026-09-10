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
const seededView = makeView('view-seeded', 1, null);
const userView = makeView('view-user', 7, null);
const widgetView = makeView('view-widget', 2, null, ViewType.FIELDS_WIDGET);

describe('computeObjectViewTargetIds', () => {
  it('should not resolve a seeded view when the flag is off', () => {
    const result = computeObjectViewTargetIds({
      views: [indexView, seededView],
      objectMetadataId: 'metadata-1',
      isSeededDefaultViewEnabled: false,
    });

    expect(result.seededDefaultViewId).toBeUndefined();
    expect(result.indexViewId).toBe('view-index');
  });

  it('should resolve the lowest-positioned non-index view regardless of array order', () => {
    const result = computeObjectViewTargetIds({
      views: [userView, indexView, seededView],
      objectMetadataId: 'metadata-1',
      isSeededDefaultViewEnabled: true,
    });

    expect(result.seededDefaultViewId).toBe('view-seeded');
    expect(result.indexViewId).toBe('view-index');
    expect(result.firstAvailableViewId).toBe('view-index');
  });

  it('should ignore fields widget views', () => {
    const result = computeObjectViewTargetIds({
      views: [indexView, widgetView],
      objectMetadataId: 'metadata-1',
      isSeededDefaultViewEnabled: true,
    });

    expect(result.seededDefaultViewId).toBeUndefined();
  });

  it('should ignore views belonging to another object', () => {
    const result = computeObjectViewTargetIds({
      views: [indexView, seededView],
      objectMetadataId: 'metadata-2',
      isSeededDefaultViewEnabled: true,
    });

    expect(result.indexViewId).toBeUndefined();
    expect(result.firstAvailableViewId).toBeUndefined();
  });
});
