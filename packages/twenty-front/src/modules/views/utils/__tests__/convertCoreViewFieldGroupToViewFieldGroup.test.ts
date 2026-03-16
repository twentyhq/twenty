import { convertCoreViewFieldGroupToViewFieldGroup } from '@/views/utils/convertCoreViewFieldGroupToViewFieldGroup';

describe('convertCoreViewFieldGroupToViewFieldGroup', () => {
  it('should convert a core view field group to a view field group', () => {
    const coreViewFieldGroup = {
      id: 'group-1',
      name: 'Group 1',
      position: 0,
      isVisible: true,
      isOverridden: false,
      viewId: 'view-1',
      viewFields: [
        {
          id: 'vf-1',
          fieldMetadataId: 'fm-1',
          position: 0,
          isVisible: true,
          size: 150,
          aggregateOperation: null,
          isOverridden: false,
        },
        {
          id: 'vf-2',
          fieldMetadataId: 'fm-2',
          position: 1,
          isVisible: false,
          size: 200,
          aggregateOperation: null,
          isOverridden: false,
        },
      ],
    };

    const result =
      convertCoreViewFieldGroupToViewFieldGroup(coreViewFieldGroup);

    expect(result).toEqual({
      __typename: 'ViewFieldGroup',
      id: 'group-1',
      name: 'Group 1',
      position: 0,
      isVisible: true,
      isOverridden: false,
      viewId: 'view-1',
      viewFields: [
        {
          __typename: 'ViewField',
          id: 'vf-1',
          fieldMetadataId: 'fm-1',
          position: 0,
          isVisible: true,
          size: 150,
          aggregateOperation: null,
          isOverridden: false,
          definition: undefined,
        },
        {
          __typename: 'ViewField',
          id: 'vf-2',
          fieldMetadataId: 'fm-2',
          position: 1,
          isVisible: false,
          size: 200,
          aggregateOperation: null,
          isOverridden: false,
          definition: undefined,
        },
      ],
    });
  });

  it('should handle a group with no view fields', () => {
    const coreViewFieldGroup = {
      id: 'group-2',
      name: 'Empty Group',
      position: 1,
      isVisible: false,
      isOverridden: false,
      viewId: 'view-1',
      viewFields: [],
    };

    const result =
      convertCoreViewFieldGroupToViewFieldGroup(coreViewFieldGroup);

    expect(result).toEqual({
      __typename: 'ViewFieldGroup',
      id: 'group-2',
      name: 'Empty Group',
      position: 1,
      isVisible: false,
      isOverridden: false,
      viewId: 'view-1',
      viewFields: [],
    });
  });

  it('should set __typename to ViewFieldGroup', () => {
    const coreViewFieldGroup = {
      id: 'group-3',
      name: 'Test',
      position: 0,
      isVisible: true,
      isOverridden: false,
      viewId: 'view-2',
      viewFields: [],
    };

    const result =
      convertCoreViewFieldGroupToViewFieldGroup(coreViewFieldGroup);

    expect(result.__typename).toBe('ViewFieldGroup');
  });
});
