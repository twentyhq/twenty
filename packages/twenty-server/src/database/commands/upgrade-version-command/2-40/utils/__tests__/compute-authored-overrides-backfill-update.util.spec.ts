import { computeAuthoredOverridesBackfillUpdate } from 'src/database/commands/upgrade-version-command/2-40/utils/compute-authored-overrides-backfill-update.util';

const CUSTOM = '20202020-aaaa-4aaa-8aaa-000000000001';
const OWNER = '20202020-bbbb-4bbb-8bbb-000000000002';

describe('computeAuthoredOverridesBackfillUpdate', () => {
  it('returns null for a converged row', () => {
    expect(
      computeAuthoredOverridesBackfillUpdate({
        metadataName: 'fieldMetadata',
        flatEntity: {
          applicationUniversalIdentifier: OWNER,
          isActive: true,
          overrides: { [CUSTOM]: { label: 'Société' } },
        },
        workspaceCustomApplicationUniversalIdentifier: CUSTOM,
      }),
    ).toBeNull();
    expect(
      computeAuthoredOverridesBackfillUpdate({
        metadataName: 'fieldMetadata',
        flatEntity: {
          applicationUniversalIdentifier: OWNER,
          isActive: true,
          overrides: null,
        },
        workspaceCustomApplicationUniversalIdentifier: CUSTOM,
      }),
    ).toBeNull();
  });

  it('lifts a flat blob under the custom key on both blobs', () => {
    expect(
      computeAuthoredOverridesBackfillUpdate({
        metadataName: 'viewField',
        flatEntity: {
          applicationUniversalIdentifier: OWNER,
          isActive: true,
          overrides: { isVisible: false, viewFieldGroupId: 'group-id' },
          universalOverrides: {
            isVisible: false,
            viewFieldGroupUniversalIdentifier: 'group',
          },
        },
        workspaceCustomApplicationUniversalIdentifier: CUSTOM,
      }),
    ).toEqual({
      overrides: {
        [CUSTOM]: { isVisible: false, viewFieldGroupId: 'group-id' },
      },
      universalOverrides: {
        [CUSTOM]: {
          isVisible: false,
          viewFieldGroupUniversalIdentifier: 'group',
        },
      },
    });
  });

  it('lifts a flat translations-only blob', () => {
    expect(
      computeAuthoredOverridesBackfillUpdate({
        metadataName: 'objectMetadata',
        flatEntity: {
          applicationUniversalIdentifier: OWNER,
          isActive: true,
          overrides: { translations: { 'fr-FR': { labelSingular: 'Société' } } },
        },
        workspaceCustomApplicationUniversalIdentifier: CUSTOM,
      }),
    ).toEqual({
      overrides: {
        [CUSTOM]: { translations: { 'fr-FR': { labelSingular: 'Société' } } },
      },
    });
  });

  it('moves a false column of a row another application owns into the custom entry', () => {
    expect(
      computeAuthoredOverridesBackfillUpdate({
        metadataName: 'objectMetadata',
        flatEntity: {
          applicationUniversalIdentifier: OWNER,
          isActive: false,
          overrides: null,
        },
        workspaceCustomApplicationUniversalIdentifier: CUSTOM,
      }),
    ).toEqual({
      overrides: { [CUSTOM]: { isActive: false } },
      isActive: true,
    });
  });

  it('merges the deactivation into a lifted flat blob and writes both blobs', () => {
    expect(
      computeAuthoredOverridesBackfillUpdate({
        metadataName: 'view',
        flatEntity: {
          applicationUniversalIdentifier: OWNER,
          isActive: false,
          overrides: { name: 'Mine' },
          universalOverrides: null,
        },
        workspaceCustomApplicationUniversalIdentifier: CUSTOM,
      }),
    ).toEqual({
      overrides: { [CUSTOM]: { name: 'Mine', isActive: false } },
      universalOverrides: { [CUSTOM]: { isActive: false } },
      isActive: true,
    });
  });

  it('keeps the other authors entries when attributing', () => {
    expect(
      computeAuthoredOverridesBackfillUpdate({
        metadataName: 'fieldMetadata',
        flatEntity: {
          applicationUniversalIdentifier: OWNER,
          isActive: false,
          overrides: { [OWNER]: { label: 'Account' } },
        },
        workspaceCustomApplicationUniversalIdentifier: CUSTOM,
      }),
    ).toEqual({
      overrides: {
        [OWNER]: { label: 'Account' },
        [CUSTOM]: { isActive: false },
      },
      isActive: true,
    });
  });

  it('keeps a custom entry that already deactivates and only restores the column', () => {
    expect(
      computeAuthoredOverridesBackfillUpdate({
        metadataName: 'fieldMetadata',
        flatEntity: {
          applicationUniversalIdentifier: OWNER,
          isActive: false,
          overrides: { [CUSTOM]: { isActive: false, label: 'Mine' } },
        },
        workspaceCustomApplicationUniversalIdentifier: CUSTOM,
      }),
    ).toEqual({
      overrides: { [CUSTOM]: { isActive: false, label: 'Mine' } },
      isActive: true,
    });
  });

  it('drops a custom reactivation that now equals the restored column', () => {
    expect(
      computeAuthoredOverridesBackfillUpdate({
        metadataName: 'fieldMetadata',
        flatEntity: {
          applicationUniversalIdentifier: OWNER,
          isActive: false,
          overrides: { [CUSTOM]: { isActive: true } },
        },
        workspaceCustomApplicationUniversalIdentifier: CUSTOM,
      }),
    ).toEqual({ overrides: null, isActive: true });
    expect(
      computeAuthoredOverridesBackfillUpdate({
        metadataName: 'fieldMetadata',
        flatEntity: {
          applicationUniversalIdentifier: OWNER,
          isActive: false,
          overrides: { [CUSTOM]: { isActive: true, label: 'Mine' } },
        },
        workspaceCustomApplicationUniversalIdentifier: CUSTOM,
      }),
    ).toEqual({ overrides: { [CUSTOM]: { label: 'Mine' } }, isActive: true });
  });

  it('attributes a false column on an engine-managed row the custom application owns', () => {
    expect(
      computeAuthoredOverridesBackfillUpdate({
        metadataName: 'viewField',
        flatEntity: {
          applicationUniversalIdentifier: CUSTOM,
          isActive: false,
          isSystemSideEffect: true,
          overrides: null,
          universalOverrides: null,
        },
        workspaceCustomApplicationUniversalIdentifier: CUSTOM,
      }),
    ).toEqual({
      overrides: { [CUSTOM]: { isActive: false } },
      universalOverrides: { [CUSTOM]: { isActive: false } },
      isActive: true,
    });
  });

  it('leaves the column of a row the custom application owns outright', () => {
    expect(
      computeAuthoredOverridesBackfillUpdate({
        metadataName: 'viewField',
        flatEntity: {
          applicationUniversalIdentifier: CUSTOM,
          isActive: false,
          isSystemSideEffect: false,
          overrides: null,
          universalOverrides: null,
        },
        workspaceCustomApplicationUniversalIdentifier: CUSTOM,
      }),
    ).toBeNull();
  });

  it('leaves an engine-derived false on the column but still lifts the blob', () => {
    expect(
      computeAuthoredOverridesBackfillUpdate({
        metadataName: 'commandMenuItem',
        flatEntity: {
          applicationUniversalIdentifier: OWNER,
          isActive: false,
          isSystemSideEffect: true,
          overrides: { label: 'Go to' },
          universalOverrides: null,
        },
        workspaceCustomApplicationUniversalIdentifier: CUSTOM,
        isActiveEngineDerived: true,
      }),
    ).toEqual({ overrides: { [CUSTOM]: { label: 'Go to' } } });
  });
});
