import { preserveApplicationLocalMetadataState } from 'src/engine/core-modules/application/application-manifest/utils/preserve-application-local-metadata-state.util';

describe('preserveApplicationLocalMetadataState', () => {
  it('keeps workspace overrides and activation while accepting app updates', () => {
    expect(
      preserveApplicationLocalMetadataState({
        existingEntity: {
          label: 'Old app label',
          overrides: { label: 'Workspace label' },
          isActive: false,
        },
        manifestEntity: {
          label: 'New app label',
          overrides: null,
          isActive: true,
        },
      }),
    ).toEqual({
      label: 'New app label',
      overrides: { label: 'Workspace label' },
      isActive: false,
    });
  });

  it('does not add local-state properties to metadata that does not support them', () => {
    expect(
      preserveApplicationLocalMetadataState({
        existingEntity: { label: 'Old app label', isActive: false },
        manifestEntity: { label: 'New app label', isActive: true },
      }),
    ).toEqual({ label: 'New app label', isActive: true });
  });

  it('preserves universal overrides used by relation-bearing metadata', () => {
    expect(
      preserveApplicationLocalMetadataState({
        existingEntity: {
          universalOverrides: { pageLayoutUniversalIdentifier: 'layout-old' },
          isActive: false,
        },
        manifestEntity: {
          universalOverrides: null,
          isActive: true,
        },
      }),
    ).toEqual({
      universalOverrides: { pageLayoutUniversalIdentifier: 'layout-old' },
      isActive: false,
    });
  });
});
