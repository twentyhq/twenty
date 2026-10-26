import { foldTransferredEntityOverrides } from 'src/database/commands/application-transfer/utils/fold-transferred-entity-overrides.util';

const SOURCE_APPLICATION_UNIVERSAL_IDENTIFIER =
  '7a1b6a4c-1111-4c3e-9a3f-000000000001';
const WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER =
  '7a1b6a4c-2222-4c3e-9a3f-000000000002';
const OTHER_APPLICATION_UNIVERSAL_IDENTIFIER =
  '7a1b6a4c-3333-4c3e-9a3f-000000000003';

const VIEW_COLUMN_PROPERTY_NAMES = new Set(['name', 'icon', 'isActive']);

const foldViewOverrides = ({
  overrides,
  isSystemSideEffect = false,
}: {
  overrides: unknown;
  isSystemSideEffect?: boolean;
}) =>
  foldTransferredEntityOverrides({
    metadataName: 'view',
    overrides,
    sourceApplicationUniversalIdentifier:
      SOURCE_APPLICATION_UNIVERSAL_IDENTIFIER,
    workspaceCustomApplicationUniversalIdentifier:
      WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
    isSystemSideEffect,
    columnPropertyNames: VIEW_COLUMN_PROPERTY_NAMES,
  });

describe('foldTransferredEntityOverrides', () => {
  it('should fold both entries into the columns with the custom entry winning', () => {
    expect(
      foldViewOverrides({
        overrides: {
          [SOURCE_APPLICATION_UNIVERSAL_IDENTIFIER]: {
            name: 'Source name',
            icon: 'IconSource',
          },
          [WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER]: {
            name: 'Custom name',
          },
        },
      }),
    ).toEqual({
      columnUpdates: { name: 'Custom name', icon: 'IconSource' },
      overrides: null,
    });
  });

  it('should keep the custom entry of an engine-managed row, which the custom application still overrides', () => {
    expect(
      foldViewOverrides({
        isSystemSideEffect: true,
        overrides: {
          [SOURCE_APPLICATION_UNIVERSAL_IDENTIFIER]: { icon: 'IconSource' },
          [WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER]: {
            isActive: false,
          },
        },
      }),
    ).toEqual({
      columnUpdates: { icon: 'IconSource' },
      overrides: {
        [WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER]: {
          isActive: false,
        },
      },
    });
  });

  it('should merge translations under the custom application, which wins per message', () => {
    expect(
      foldViewOverrides({
        overrides: {
          [SOURCE_APPLICATION_UNIVERSAL_IDENTIFIER]: {
            translations: { 'fr-FR': { name: 'Source', icon: 'Icône' } },
          },
          [WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER]: {
            translations: { 'fr-FR': { name: 'Personnalisé' } },
          },
        },
      }),
    ).toEqual({
      columnUpdates: {},
      overrides: {
        [WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER]: {
          translations: { 'fr-FR': { name: 'Personnalisé', icon: 'Icône' } },
        },
      },
    });
  });

  it('should treat legacy non-authored overrides as custom application edits', () => {
    expect(foldViewOverrides({ overrides: { name: 'Legacy name' } })).toEqual({
      columnUpdates: { name: 'Legacy name' },
      overrides: null,
    });
  });

  it('should leave other authors and properties without a column untouched', () => {
    expect(
      foldViewOverrides({
        overrides: {
          [OTHER_APPLICATION_UNIVERSAL_IDENTIFIER]: { name: 'Other' },
          [WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER]: {
            position: 3,
          },
        },
      }),
    ).toEqual({
      columnUpdates: {},
      overrides: {
        [OTHER_APPLICATION_UNIVERSAL_IDENTIFIER]: { name: 'Other' },
        [WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER]: { position: 3 },
      },
    });
  });
});
