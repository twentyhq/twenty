import { computePageLayoutWidgetPositionUpdates } from '@/side-panel/pages/record-creation-form-settings/utils/computePageLayoutWidgetPositionUpdates';
import {
  PageLayoutTabLayoutMode,
  PageLayoutWidgetVerticalListHeightBehavior,
} from '~/generated-metadata/graphql';

const buildRecordFormField = (
  fieldMetadataId: string,
  widgets: {
    id: string;
    index: number;
    heightBehavior?: PageLayoutWidgetVerticalListHeightBehavior;
  }[],
) => ({
  fieldMetadataItem: { id: fieldMetadataId },
  widgets: widgets.map(({ id, index, heightBehavior }) => ({
    id,
    isActive: true,
    position: {
      __typename: 'PageLayoutWidgetVerticalListPosition' as const,
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      index,
      heightBehavior,
    },
  })),
  isVisible: true,
});

const buildPositionUpdate = (widgetId: string, index: number) => ({
  widgetId,
  position: { layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST, index },
});

const NAME_FIELD = buildRecordFormField('field-name', [
  { id: 'name-widget', index: 0 },
]);
const DOMAIN_FIELD = buildRecordFormField('field-domain', [
  { id: 'domain-widget', index: 1 },
]);
const OWNER_FIELD = buildRecordFormField('field-owner', [
  { id: 'owner-person-widget', index: 2 },
  { id: 'owner-company-widget', index: 3 },
]);

describe('computePageLayoutWidgetPositionUpdates', () => {
  const recordFormFields = [NAME_FIELD, DOMAIN_FIELD, OWNER_FIELD];

  it('should not update widgets that keep their index', () => {
    expect(
      computePageLayoutWidgetPositionUpdates({
        recordFormFields,
        reorderedRecordFormFields: recordFormFields,
      }),
    ).toEqual([]);
  });

  it('should move every widget of a dragged field and shift the fields it passed', () => {
    expect(
      computePageLayoutWidgetPositionUpdates({
        recordFormFields,
        reorderedRecordFormFields: [OWNER_FIELD, NAME_FIELD, DOMAIN_FIELD],
      }),
    ).toEqual([
      buildPositionUpdate('owner-person-widget', 0),
      buildPositionUpdate('owner-company-widget', 1),
      buildPositionUpdate('name-widget', 2),
      buildPositionUpdate('domain-widget', 3),
    ]);
  });

  it('should keep fields that are not reordered in their slot', () => {
    expect(
      computePageLayoutWidgetPositionUpdates({
        recordFormFields,
        reorderedRecordFormFields: [OWNER_FIELD, NAME_FIELD],
      }),
    ).toEqual([
      buildPositionUpdate('owner-person-widget', 0),
      buildPositionUpdate('owner-company-widget', 1),
      buildPositionUpdate('domain-widget', 2),
      buildPositionUpdate('name-widget', 3),
    ]);
  });

  it('should renumber widgets whose stored index is sparse', () => {
    const sparseDomainField = buildRecordFormField('field-domain', [
      { id: 'domain-widget', index: 5 },
    ]);

    expect(
      computePageLayoutWidgetPositionUpdates({
        recordFormFields: [NAME_FIELD, sparseDomainField],
        reorderedRecordFormFields: [NAME_FIELD, sparseDomainField],
      }),
    ).toEqual([buildPositionUpdate('domain-widget', 1)]);
  });

  it('should keep the height behavior of a moved widget', () => {
    const fillingDomainField = buildRecordFormField('field-domain', [
      {
        id: 'domain-widget',
        index: 1,
        heightBehavior: PageLayoutWidgetVerticalListHeightBehavior.TAB_VIEWPORT,
      },
    ]);

    expect(
      computePageLayoutWidgetPositionUpdates({
        recordFormFields: [NAME_FIELD, fillingDomainField],
        reorderedRecordFormFields: [fillingDomainField, NAME_FIELD],
      }),
    ).toEqual([
      {
        widgetId: 'domain-widget',
        position: {
          layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
          index: 0,
          heightBehavior:
            PageLayoutWidgetVerticalListHeightBehavior.TAB_VIEWPORT,
        },
      },
      buildPositionUpdate('name-widget', 1),
    ]);
  });
});
