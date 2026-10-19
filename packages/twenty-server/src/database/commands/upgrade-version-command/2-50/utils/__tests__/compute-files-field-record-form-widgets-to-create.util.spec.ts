import {
  FieldMetadataType,
  PageLayoutTabLayoutMode,
} from 'twenty-shared/types';

import { computeFilesFieldRecordFormWidgetsToCreate } from 'src/database/commands/upgrade-version-command/2-50/utils/compute-files-field-record-form-widgets-to-create.util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { buildSystemFormFieldPageLayoutWidget } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/build-system-form-field-page-layout-widget.util';
import { getRecordFormPageLayoutTabUniversalIdentifier } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/get-record-form-page-layout-tab-universal-identifier.util';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { type UniversalFlatPageLayoutWidget } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout-widget.type';

const applicationUniversalIdentifier = 'a1a2a3a4-a5a6-4000-8000-000000000001';
const objectUniversalIdentifier = 'b1b2b3b4-b5b6-4000-8000-000000000001';

const recordFormPageLayoutTabUniversalIdentifier =
  getRecordFormPageLayoutTabUniversalIdentifier({
    objectApplicationUniversalIdentifier: applicationUniversalIdentifier,
    objectMetadataUniversalIdentifier: objectUniversalIdentifier,
  });

const field = (name: string, type: FieldMetadataType, isSystem = false) =>
  getFlatFieldMetadataMock({
    universalIdentifier: name,
    objectMetadataId: objectUniversalIdentifier,
    objectMetadataUniversalIdentifier: objectUniversalIdentifier,
    applicationUniversalIdentifier,
    name,
    type,
    isSystem,
  });

const fields = [
  field('name', FieldMetadataType.TEXT),
  field('city', FieldMetadataType.TEXT),
  field('notes', FieldMetadataType.TEXT),
  field('contract', FieldMetadataType.FILES),
  field('photos', FieldMetadataType.FILES),
  field('avatar', FieldMetadataType.FILES, true),
];

const flatObjectMetadataMaps = addFlatEntityToFlatEntityMapsOrThrow({
  flatEntity: getFlatObjectMetadataMock({
    universalIdentifier: objectUniversalIdentifier,
    applicationUniversalIdentifier,
    labelIdentifierFieldMetadataUniversalIdentifier: 'name',
    fieldUniversalIdentifiers: fields.map(
      ({ universalIdentifier }) => universalIdentifier,
    ),
  }),
  flatEntityMaps: createEmptyFlatEntityMaps(),
});

const flatFieldMetadataMaps = fields.reduce<FlatEntityMaps<FlatFieldMetadata>>(
  (flatEntityMaps, flatEntity) =>
    addFlatEntityToFlatEntityMapsOrThrow({ flatEntity, flatEntityMaps }),
  createEmptyFlatEntityMaps(),
);

const formFieldWidget = (fieldUniversalIdentifier: string, index: number) =>
  buildSystemFormFieldPageLayoutWidget({
    applicationUniversalIdentifier,
    pageLayoutTabUniversalIdentifier:
      recordFormPageLayoutTabUniversalIdentifier,
    objectMetadataUniversalIdentifier: objectUniversalIdentifier,
    flatFieldMetadata: { universalIdentifier: fieldUniversalIdentifier },
    index,
  });

const existingWidgets = [
  formFieldWidget('name', 0),
  formFieldWidget('city', 1),
];

const buildPageLayoutMaps = (widgets: UniversalFlatPageLayoutWidget[]) =>
  ({
    flatPageLayoutTabMaps: {
      byUniversalIdentifier: {
        [recordFormPageLayoutTabUniversalIdentifier]: {
          universalIdentifier: recordFormPageLayoutTabUniversalIdentifier,
          isSystemSideEffect: true,
          deletedAt: null,
          widgetUniversalIdentifiers: widgets.map(
            ({ universalIdentifier }) => universalIdentifier,
          ),
        },
      },
    },
    flatPageLayoutWidgetMaps: {
      byUniversalIdentifier: Object.fromEntries(
        widgets.map((widget) => [widget.universalIdentifier, widget]),
      ),
    },
  }) as unknown as Pick<
    AllFlatEntityMaps,
    'flatPageLayoutTabMaps' | 'flatPageLayoutWidgetMaps'
  >;

const computeWithWidgets = (widgets: UniversalFlatPageLayoutWidget[]) =>
  computeFilesFieldRecordFormWidgetsToCreate({
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    ...buildPageLayoutMaps(widgets),
  });

describe('computeFilesFieldRecordFormWidgetsToCreate', () => {
  it('should append a widget for each eligible files field missing one', () => {
    const widgetsToCreate = computeWithWidgets(existingWidgets);

    expect(
      widgetsToCreate.map(({ universalConfiguration, position }) => ({
        universalConfiguration,
        position,
      })),
    ).toEqual([
      {
        universalConfiguration: {
          configurationType: WidgetConfigurationType.FORM_FIELD,
          fieldMetadataId: 'contract',
        },
        position: {
          layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
          index: 2,
        },
      },
      {
        universalConfiguration: {
          configurationType: WidgetConfigurationType.FORM_FIELD,
          fieldMetadataId: 'photos',
        },
        position: {
          layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
          index: 3,
        },
      },
    ]);
  });

  it.each([
    ['kept', null],
    ['removed from the form', '2026-10-19T00:00:00.000Z'],
  ])(
    'should create nothing on a second run once the widgets are %s',
    (_, deletedAt) => {
      const firstRunWidgets = computeWithWidgets(existingWidgets);

      expect(firstRunWidgets).toHaveLength(2);
      expect(
        computeWithWidgets([
          ...existingWidgets,
          ...firstRunWidgets.map((widget) => ({ ...widget, deletedAt })),
        ]),
      ).toEqual([]);
    },
  );
});
