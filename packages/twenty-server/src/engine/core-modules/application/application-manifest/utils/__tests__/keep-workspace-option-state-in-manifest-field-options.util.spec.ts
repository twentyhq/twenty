import { FieldMetadataType } from 'twenty-shared/types';

import { keepWorkspaceOptionStateInManifestFieldOptions } from 'src/engine/core-modules/application/application-manifest/utils/keep-workspace-option-state-in-manifest-field-options.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadataOption } from 'src/engine/metadata-modules/flat-field-metadata-option/types/flat-field-metadata-option.type';
import { type UniversalFlatFieldMetadataOption } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata-option.type';

const APPLICATION_UNIVERSAL_IDENTIFIER = '20202020-0000-4000-8000-0000000000aa';
const WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER =
  '20202020-0000-4000-8000-0000000000bb';
const FIELD_UNIVERSAL_IDENTIFIER = '20202020-0000-4000-8000-000000000001';
const OPEN_OPTION_ID = '20202020-0000-4000-8000-000000000101';
const CLOSED_OPTION_ID = '20202020-0000-4000-8000-000000000102';
const ARCHIVED_OPTION_ID = '20202020-0000-4000-8000-000000000201';

const manifestOptions = [
  {
    id: OPEN_OPTION_ID,
    value: 'OPEN',
    label: 'Open',
    color: 'green',
    position: 0,
  },
  {
    id: CLOSED_OPTION_ID,
    value: 'CLOSED',
    label: 'Closed',
    color: 'red',
    position: 1,
  },
] as const;

const buildManifestField = () =>
  getFlatFieldMetadataMock({
    universalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
    objectMetadataId: '20202020-0000-4000-8000-000000000010',
    type: FieldMetadataType.SELECT,
    applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    options: manifestOptions.map((option) => ({ ...option })),
  });

const buildOptionRow = ({
  universalIdentifier,
  value,
  label,
  color,
  position,
  applicationUniversalIdentifier = APPLICATION_UNIVERSAL_IDENTIFIER,
  overrides = null,
}: Pick<
  UniversalFlatFieldMetadataOption,
  'universalIdentifier' | 'value' | 'label' | 'color' | 'position'
> &
  Partial<
    Pick<
      UniversalFlatFieldMetadataOption,
      'applicationUniversalIdentifier' | 'overrides'
    >
  >): FlatFieldMetadataOption => ({
  id: universalIdentifier,
  workspaceId: '20202020-0000-4000-8000-0000000000ff',
  universalIdentifier,
  applicationId: applicationUniversalIdentifier,
  applicationUniversalIdentifier,
  fieldMetadataId: FIELD_UNIVERSAL_IDENTIFIER,
  fieldMetadataUniversalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
  value,
  label,
  color,
  position,
  isActive: true,
  overrides,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
});

const manifestOptionRows = manifestOptions.map(({ id, ...columns }) =>
  buildOptionRow({ universalIdentifier: id, ...columns }),
);

const toByUniversalIdentifier = <
  TFlatEntity extends { universalIdentifier: string },
>(
  flatEntities: TFlatEntity[],
) => ({
  byUniversalIdentifier: Object.fromEntries(
    flatEntities.map((flatEntity) => [
      flatEntity.universalIdentifier,
      flatEntity,
    ]),
  ),
});

const keepWorkspaceOptionState = (
  existingOptionRows: FlatFieldMetadataOption[],
) => {
  const manifestField = buildManifestField();

  keepWorkspaceOptionStateInManifestFieldOptions({
    toFlatFieldMetadataMapsToMutate: toByUniversalIdentifier([manifestField]),
    toFlatFieldMetadataOptionMaps: toByUniversalIdentifier(manifestOptionRows),
    existingFlatFieldMetadataOptionMaps:
      toByUniversalIdentifier(existingOptionRows),
    workspaceCustomApplicationUniversalIdentifier:
      WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
  });

  return manifestField.options;
};

describe('keepWorkspaceOptionStateInManifestFieldOptions', () => {
  it('leaves the manifest options untouched when the workspace changed nothing', () => {
    expect(keepWorkspaceOptionState(manifestOptionRows)).toEqual(
      manifestOptions,
    );
  });

  it('applies the workspace overrides, deactivations and own options', () => {
    const options = keepWorkspaceOptionState([
      {
        ...manifestOptionRows[0],
        // The workspace renamed the option before this version of the manifest relabelled it.
        label: 'Opened',
        overrides: {
          [WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER]: {
            label: 'To do',
            position: 2,
          },
        },
      },
      {
        ...manifestOptionRows[1],
        overrides: {
          [WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER]: {
            isActive: false,
            position: 0,
          },
        },
      },
      buildOptionRow({
        universalIdentifier: ARCHIVED_OPTION_ID,
        value: 'ARCHIVED',
        label: 'Archived',
        color: 'gray',
        position: 1,
        applicationUniversalIdentifier:
          WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
      }),
    ]);

    expect(options).toEqual([
      {
        id: CLOSED_OPTION_ID,
        value: 'CLOSED',
        label: 'Closed',
        color: 'red',
        position: 0,
        isActive: false,
      },
      {
        id: ARCHIVED_OPTION_ID,
        value: 'ARCHIVED',
        label: 'Archived',
        color: 'gray',
        position: 1,
        isCustom: true,
      },
      {
        id: OPEN_OPTION_ID,
        value: 'OPEN',
        label: 'To do',
        color: 'green',
        position: 2,
      },
    ]);
  });

  it('skips a workspace option whose value the manifest now declares', () => {
    const options = keepWorkspaceOptionState([
      {
        ...manifestOptionRows[0],
        overrides: {
          [WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER]: {
            label: 'To do',
          },
        },
      },
      buildOptionRow({
        universalIdentifier: ARCHIVED_OPTION_ID,
        value: 'CLOSED',
        label: 'Finished',
        color: 'blue',
        position: 5,
        applicationUniversalIdentifier:
          WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
      }),
    ]);

    expect(options?.map(({ value }) => value)).toEqual(['OPEN', 'CLOSED']);
  });
});
