import { computePageLayoutWidgetPositionUpdates } from '@/side-panel/pages/record-creation-form-settings/utils/computePageLayoutWidgetPositionUpdates';
import { PageLayoutTabLayoutMode } from '~/generated-metadata/graphql';

const buildVerticalListPosition = (index: number) => ({
  __typename: 'PageLayoutWidgetVerticalListPosition' as const,
  layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
  index,
});

const buildRecordFormField = (
  fieldMetadataId: string,
  widgets: { id: string; index: number }[],
) => ({
  fieldMetadataItem: { id: fieldMetadataId },
  widgets: widgets.map(({ id, index }) => ({
    id,
    isActive: true,
    position: buildVerticalListPosition(index),
  })),
  isVisible: true,
});

const buildPositionUpdate = (widgetId: string, index: number) => ({
  widgetId,
  position: { layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST, index },
});

describe('computePageLayoutWidgetPositionUpdates', () => {
  const recordFormFields = [
    buildRecordFormField('field-name', [{ id: 'name-widget', index: 0 }]),
    buildRecordFormField('field-domain', [{ id: 'domain-widget', index: 1 }]),
    buildRecordFormField('field-owner', [
      { id: 'owner-person-widget', index: 2 },
      { id: 'owner-company-widget', index: 3 },
    ]),
  ];

  it('should not update widgets that keep their index', () => {
    expect(
      computePageLayoutWidgetPositionUpdates({
        recordFormFields,
        orderedFieldMetadataIds: ['field-name', 'field-domain', 'field-owner'],
      }),
    ).toEqual([]);
  });

  it('should move every widget of a dragged field and shift the fields it passed', () => {
    expect(
      computePageLayoutWidgetPositionUpdates({
        recordFormFields,
        orderedFieldMetadataIds: ['field-owner', 'field-name', 'field-domain'],
      }),
    ).toEqual([
      buildPositionUpdate('owner-person-widget', 0),
      buildPositionUpdate('owner-company-widget', 1),
      buildPositionUpdate('name-widget', 2),
      buildPositionUpdate('domain-widget', 3),
    ]);
  });

  it('should keep fields missing from the ordered list in their slot', () => {
    expect(
      computePageLayoutWidgetPositionUpdates({
        recordFormFields,
        orderedFieldMetadataIds: ['field-owner', 'field-name'],
      }),
    ).toEqual([
      buildPositionUpdate('owner-person-widget', 0),
      buildPositionUpdate('owner-company-widget', 1),
      buildPositionUpdate('domain-widget', 2),
      buildPositionUpdate('name-widget', 3),
    ]);
  });

  it('should renumber widgets whose stored index is sparse', () => {
    expect(
      computePageLayoutWidgetPositionUpdates({
        recordFormFields: [
          buildRecordFormField('field-name', [{ id: 'name-widget', index: 0 }]),
          buildRecordFormField('field-domain', [
            { id: 'domain-widget', index: 5 },
          ]),
        ],
        orderedFieldMetadataIds: ['field-name', 'field-domain'],
      }),
    ).toEqual([buildPositionUpdate('domain-widget', 1)]);
  });
});
