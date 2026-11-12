import { findForeignFieldMetadataOptionsCollidingWithApplicationOptions } from 'src/engine/core-modules/application/application-manifest/utils/find-foreign-field-metadata-options-colliding-with-application-options.util';
import { type FlatFieldMetadataOption } from 'src/engine/metadata-modules/flat-field-metadata-option/types/flat-field-metadata-option.type';

const APPLICATION_UNIVERSAL_IDENTIFIER = '20202020-0000-4000-8000-0000000000aa';
const WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER =
  '20202020-0000-4000-8000-0000000000bb';
const APP_FIELD_UNIVERSAL_IDENTIFIER = '20202020-0000-4000-8000-000000000001';
const OTHER_FIELD_UNIVERSAL_IDENTIFIER = '20202020-0000-4000-8000-000000000002';

const buildFlatFieldMetadataOption = ({
  universalIdentifier,
  applicationUniversalIdentifier,
  fieldMetadataUniversalIdentifier = APP_FIELD_UNIVERSAL_IDENTIFIER,
  value,
}: {
  universalIdentifier: string;
  applicationUniversalIdentifier: string;
  fieldMetadataUniversalIdentifier?: string;
  value: string;
}): FlatFieldMetadataOption => ({
  id: universalIdentifier,
  workspaceId: '20202020-0000-4000-8000-0000000000ff',
  universalIdentifier,
  applicationId: applicationUniversalIdentifier,
  applicationUniversalIdentifier,
  fieldMetadataId: fieldMetadataUniversalIdentifier,
  fieldMetadataUniversalIdentifier,
  value,
  label: value,
  color: 'green',
  position: 0,
  isActive: true,
  overrides: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
});

const toByUniversalIdentifier = (options: FlatFieldMetadataOption[]) => ({
  byUniversalIdentifier: Object.fromEntries(
    options.map((option) => [option.universalIdentifier, option]),
  ),
});

const appOpenOption = buildFlatFieldMetadataOption({
  universalIdentifier: '20202020-0000-4000-8000-000000000101',
  applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  value: 'OPEN',
});

describe('findForeignFieldMetadataOptionsCollidingWithApplicationOptions', () => {
  it('returns another application rows sharing a value with the app rows of the same field', () => {
    const rekeyedOpenOption = buildFlatFieldMetadataOption({
      universalIdentifier: '20202020-0000-4000-8000-000000000201',
      applicationUniversalIdentifier:
        WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
      value: 'OPEN',
    });

    expect(
      findForeignFieldMetadataOptionsCollidingWithApplicationOptions({
        existingFlatFieldMetadataOptionMaps: toByUniversalIdentifier([
          rekeyedOpenOption,
        ]),
        toFlatFieldMetadataOptionMaps: toByUniversalIdentifier([appOpenOption]),
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      }),
    ).toEqual([rekeyedOpenOption]);
  });

  it('leaves rows whose value or field the app does not declare, and the app own rows', () => {
    const workspaceAddedOption = buildFlatFieldMetadataOption({
      universalIdentifier: '20202020-0000-4000-8000-000000000202',
      applicationUniversalIdentifier:
        WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
      value: 'ARCHIVED',
    });
    const otherFieldOpenOption = buildFlatFieldMetadataOption({
      universalIdentifier: '20202020-0000-4000-8000-000000000203',
      applicationUniversalIdentifier:
        WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
      fieldMetadataUniversalIdentifier: OTHER_FIELD_UNIVERSAL_IDENTIFIER,
      value: 'OPEN',
    });

    expect(
      findForeignFieldMetadataOptionsCollidingWithApplicationOptions({
        existingFlatFieldMetadataOptionMaps: toByUniversalIdentifier([
          appOpenOption,
          workspaceAddedOption,
          otherFieldOpenOption,
        ]),
        toFlatFieldMetadataOptionMaps: toByUniversalIdentifier([appOpenOption]),
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      }),
    ).toEqual([]);
  });
});
