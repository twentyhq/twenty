import { getViewMetadataSliceFromViews } from '@/metadata-store/utils/getViewMetadataSliceFromViews';
import { replaceObjectViewsInViewMetadataSlice } from '@/metadata-store/utils/replaceObjectViewsInViewMetadataSlice';
import { isDefined } from 'twenty-shared/utils';
import { mockedViews } from '~/testing/mock-data/generated/metadata/views/mock-views-data';

const [replacedObjectView] = mockedViews;
const otherObjectView = mockedViews.find(
  (view) => view.objectMetadataId !== replacedObjectView.objectMetadataId,
);

describe('replaceObjectViewsInViewMetadataSlice', () => {
  it('replaces the views and children of one object and keeps the others', () => {
    if (!isDefined(otherObjectView)) {
      throw new Error('Expected mocked views on two objects');
    }

    const replacedObjectViews = mockedViews.filter(
      (view) => view.objectMetadataId === replacedObjectView.objectMetadataId,
    );
    const otherObjectViews = mockedViews.filter(
      (view) => view.objectMetadataId !== replacedObjectView.objectMetadataId,
    );
    const fetchedObjectViews = replacedObjectViews.slice(1);

    const result = replaceObjectViewsInViewMetadataSlice({
      objectMetadataId: replacedObjectView.objectMetadataId,
      currentSlice: getViewMetadataSliceFromViews(mockedViews),
      fetchedObjectSlice: getViewMetadataSliceFromViews(fetchedObjectViews),
    });

    expect(result.views.map((view) => view.id).sort()).toEqual(
      [...otherObjectViews, ...fetchedObjectViews]
        .map((view) => view.id)
        .sort(),
    );
    expect(
      result.viewFields.some(
        (viewField) => viewField.viewId === replacedObjectView.id,
      ),
    ).toBe(false);
    expect(
      result.viewFields.filter(
        (viewField) => viewField.viewId === otherObjectView.id,
      ),
    ).toHaveLength(otherObjectView.viewFields.length);
  });
});
