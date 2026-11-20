import { type FlatView } from '@/metadata-store/types/FlatView';
import { type FlatViewField } from '@/metadata-store/types/FlatViewField';
import { type MinimalView } from '@/metadata-store/types/MinimalMetadata';
import { type ViewMetadataSlice } from '@/metadata-store/types/ViewMetadataSlice';
import { mergeMinimalViewsIntoViewMetadataSlice } from '@/metadata-store/utils/mergeMinimalViewsIntoViewMetadataSlice';
import { ViewType, ViewVisibility } from '~/generated-metadata/graphql';

const createMinimalView = (
  id: string,
  objectMetadataId: string,
  name = id,
): MinimalView => ({
  id,
  universalIdentifier: `${id}-universal-identifier`,
  name,
  icon: 'IconList',
  type: ViewType.TABLE,
  key: null,
  objectMetadataId,
  position: 0,
  visibility: ViewVisibility.WORKSPACE,
  isActive: true,
});

const createFlatView = (id: string, objectMetadataId: string): FlatView =>
  ({ id, objectMetadataId, name: id, isCompact: true }) as FlatView;

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

describe('mergeMinimalViewsIntoViewMetadataSlice', () => {
  it('keeps full rows and children only for loaded objects', () => {
    const result = mergeMinimalViewsIntoViewMetadataSlice({
      minimalViews: [
        createMinimalView('company-all', 'company', 'Renamed'),
        createMinimalView('person-all', 'person'),
      ],
      currentSlice: createSlice({
        views: [
          createFlatView('company-all', 'company'),
          createFlatView('person-all', 'person'),
        ],
        viewFields: [
          createFlatViewField('company-all-name', 'company-all'),
          createFlatViewField('person-all-name', 'person-all'),
        ],
      }),
      loadedViewHashByObjectMetadataId: { company: 'hash-1' },
    });

    expect(result.views).toEqual([
      expect.objectContaining({
        id: 'company-all',
        name: 'Renamed',
        isCompact: true,
      }),
      createMinimalView('person-all', 'person'),
    ]);
    expect(result.viewFields.map((viewField) => viewField.id)).toEqual([
      'company-all-name',
    ]);
  });

  it('drops views that are no longer in the minimal list', () => {
    const result = mergeMinimalViewsIntoViewMetadataSlice({
      minimalViews: [],
      currentSlice: createSlice({
        views: [createFlatView('company-all', 'company')],
        viewFields: [createFlatViewField('company-all-name', 'company-all')],
      }),
      loadedViewHashByObjectMetadataId: { company: 'hash-1' },
    });

    expect(result.views).toEqual([]);
    expect(result.viewFields).toEqual([]);
  });
});
