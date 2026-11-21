import { type FlatView } from '@/metadata-store/types/FlatView';
import { type FlatViewField } from '@/metadata-store/types/FlatViewField';
import { type ViewMetadataSlice } from '@/metadata-store/types/ViewMetadataSlice';
import { replaceObjectViewsInViewMetadataSlice } from '@/metadata-store/utils/replaceObjectViewsInViewMetadataSlice';

const createFlatView = (id: string, objectMetadataId: string): FlatView =>
  ({ id, objectMetadataId, name: id }) as FlatView;

const createFlatViewField = (id: string, viewId: string): FlatViewField =>
  ({ id, viewId }) as FlatViewField;

const createSlice = (
  overrides: Partial<ViewMetadataSlice>,
): ViewMetadataSlice => ({
  views: [],
  viewFields: [],
  viewFilters: [],
  viewSorts: [],
  viewGroups: [],
  viewFilterGroups: [],
  viewFieldGroups: [],
  ...overrides,
});

describe('replaceObjectViewsInViewMetadataSlice', () => {
  it('replaces the views and children of one object and keeps the others', () => {
    const result = replaceObjectViewsInViewMetadataSlice({
      objectMetadataId: 'company',
      currentSlice: createSlice({
        views: [
          createFlatView('company-all', 'company'),
          createFlatView('company-removed', 'company'),
          createFlatView('person-all', 'person'),
        ],
        viewFields: [
          createFlatViewField('company-all-name', 'company-all'),
          createFlatViewField('company-removed-name', 'company-removed'),
          createFlatViewField('person-all-name', 'person-all'),
        ],
      }),
      fetchedObjectSlice: createSlice({
        views: [createFlatView('company-all', 'company')],
        viewFields: [createFlatViewField('company-all-domain', 'company-all')],
      }),
    });

    expect(result.views.map((view) => view.id)).toEqual([
      'person-all',
      'company-all',
    ]);
    expect(result.viewFields.map((viewField) => viewField.id)).toEqual([
      'person-all-name',
      'company-all-domain',
    ]);
  });
});
