import { type ViewSort } from '@/views/types/ViewSort';
import { mapViewSortToCreateViewSortMutationVariables } from '@/views/utils/mapViewSortToCreateViewSortMutationVariables';
import { ViewSortDirection } from '~/generated-metadata/graphql';

describe('mapViewSortToCreateViewSortMutationVariables', () => {
  it('keeps the sub-field and relation target of a sort on a field of the related record', () => {
    const viewSort: ViewSort = {
      id: 'sort-1',
      fieldMetadataId: 'company-field-id',
      direction: ViewSortDirection.DESC,
      subFieldName: 'addressCountry',
      relationTargetFieldMetadataId: 'company-address-field-id',
      viewId: 'source-view-id',
    };

    expect(
      mapViewSortToCreateViewSortMutationVariables({
        viewSort,
        viewId: 'new-view-id',
      }),
    ).toEqual({
      input: {
        id: 'sort-1',
        fieldMetadataId: 'company-field-id',
        viewId: 'new-view-id',
        direction: ViewSortDirection.DESC,
        subFieldName: 'addressCountry',
        relationTargetFieldMetadataId: 'company-address-field-id',
      },
    });
  });

  it('sends null for a sort without sub-field or relation target', () => {
    expect(
      mapViewSortToCreateViewSortMutationVariables({
        viewSort: {
          id: 'sort-1',
          fieldMetadataId: 'name-field-id',
          direction: ViewSortDirection.ASC,
        },
        viewId: 'new-view-id',
      }).input,
    ).toEqual(
      expect.objectContaining({
        subFieldName: null,
        relationTargetFieldMetadataId: null,
      }),
    );
  });
});
