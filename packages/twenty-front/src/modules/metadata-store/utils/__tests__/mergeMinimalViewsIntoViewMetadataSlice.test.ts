import { type FlatView } from '@/metadata-store/types/FlatView';
import { type MinimalView } from '@/metadata-store/types/MinimalMetadata';
import { getViewMetadataSliceFromViews } from '@/metadata-store/utils/getViewMetadataSliceFromViews';
import { mergeMinimalViewsIntoViewMetadataSlice } from '@/metadata-store/utils/mergeMinimalViewsIntoViewMetadataSlice';
import { isDefined } from 'twenty-shared/utils';
import { mockedViews } from '~/testing/mock-data/generated/metadata/views/mock-views-data';

const toMinimalView = ({
  flatView,
  name = flatView.name,
}: {
  flatView: FlatView;
  name?: string;
}): MinimalView => ({
  id: flatView.id,
  universalIdentifier: flatView.universalIdentifier ?? flatView.id,
  name,
  icon: flatView.icon,
  type: flatView.type,
  key: flatView.key,
  objectMetadataId: flatView.objectMetadataId,
  position: flatView.position,
  isPrivate: flatView.isPrivate,
  isActive: flatView.isActive,
});

const currentSlice = getViewMetadataSliceFromViews(mockedViews);
const [loadedObjectView] = currentSlice.views;
const notLoadedObjectView = currentSlice.views.find(
  (view) => view.objectMetadataId !== loadedObjectView.objectMetadataId,
);

describe('mergeMinimalViewsIntoViewMetadataSlice', () => {
  it('keeps full rows and children only for loaded objects', () => {
    if (!isDefined(notLoadedObjectView)) {
      throw new Error('Expected mocked views on two objects');
    }

    const renamedLoadedObjectMinimalView = toMinimalView({
      flatView: loadedObjectView,
      name: 'Renamed',
    });
    const notLoadedObjectMinimalView = toMinimalView({
      flatView: notLoadedObjectView,
    });

    const result = mergeMinimalViewsIntoViewMetadataSlice({
      minimalViews: [
        renamedLoadedObjectMinimalView,
        notLoadedObjectMinimalView,
      ],
      currentSlice,
      loadedViewHashByObjectMetadataId: {
        [loadedObjectView.objectMetadataId]: 'hash-1',
      },
    });

    expect(result.views).toEqual([
      { ...loadedObjectView, ...renamedLoadedObjectMinimalView },
      notLoadedObjectMinimalView,
    ]);
    expect(
      result.viewFields.every(
        (viewField) => viewField.viewId === loadedObjectView.id,
      ),
    ).toBe(true);
  });

  it('drops views that are no longer in the minimal list', () => {
    const result = mergeMinimalViewsIntoViewMetadataSlice({
      minimalViews: [],
      currentSlice,
      loadedViewHashByObjectMetadataId: {
        [loadedObjectView.objectMetadataId]: 'hash-1',
      },
    });

    expect(result.views).toEqual([]);
    expect(result.viewFields).toEqual([]);
  });
});
