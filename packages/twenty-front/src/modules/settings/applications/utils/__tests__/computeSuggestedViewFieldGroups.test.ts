import { computeSuggestedViewFieldGroups } from '@/settings/applications/utils/computeSuggestedViewFieldGroups';

const objectMetadataItems = [
  {
    id: 'company-id',
    labelSingular: 'Company',
    labelPlural: 'Companies',
    fields: [
      { id: 'industry-field-id', label: 'Industry' },
      { id: 'employees-field-id', label: 'Employees' },
    ],
  },
];

describe('computeSuggestedViewFieldGroups', () => {
  it('groups suggestions per view in their declared order and resolves the view name', () => {
    expect(
      computeSuggestedViewFieldGroups({
        suggestedViewFields: [
          {
            viewId: 'index-view-id',
            objectMetadataId: 'company-id',
            fieldMetadataId: 'employees-field-id',
            position: 1,
          },
          {
            viewId: 'index-view-id',
            objectMetadataId: 'company-id',
            fieldMetadataId: 'industry-field-id',
            position: 0,
          },
        ],
        objectMetadataItems,
        viewsById: new Map([
          [
            'index-view-id',
            { id: 'index-view-id', name: 'All {objectLabelPlural}' },
          ],
        ]),
      }),
    ).toEqual([
      {
        viewId: 'index-view-id',
        viewName: 'All Companies',
        fields: [
          { id: 'industry-field-id', label: 'Industry' },
          { id: 'employees-field-id', label: 'Employees' },
        ],
      },
    ]);
  });

  it('skips suggestions on views or fields the user cannot see', () => {
    expect(
      computeSuggestedViewFieldGroups({
        suggestedViewFields: [
          {
            viewId: 'hidden-view-id',
            objectMetadataId: 'company-id',
            fieldMetadataId: 'industry-field-id',
            position: 0,
          },
          {
            viewId: 'index-view-id',
            objectMetadataId: 'company-id',
            fieldMetadataId: 'unknown-field-id',
            position: 1,
          },
        ],
        objectMetadataItems,
        viewsById: new Map([
          ['index-view-id', { id: 'index-view-id', name: 'All Companies' }],
        ]),
      }),
    ).toEqual([]);
  });
});
