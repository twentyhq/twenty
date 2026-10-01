import { hasFrontComponentChecksumChanged } from '@/front-components/utils/hasFrontComponentChecksumChanged';

const SHARED_DEPENDENCIES_CHECKSUM = 'shared-dependencies-checksum';

const frontComponent = {
  builtComponentChecksum: 'component-checksum',
  frontComponentSharedDependenciesChecksum: SHARED_DEPENDENCIES_CHECKSUM,
};

describe('hasFrontComponentChecksumChanged', () => {
  it('returns false when both checksums are unchanged', () => {
    expect(
      hasFrontComponentChecksumChanged({
        previousFrontComponent: frontComponent,
        nextFrontComponent: { ...frontComponent },
      }),
    ).toBe(false);
  });

  it('returns true when the built component checksum changed', () => {
    expect(
      hasFrontComponentChecksumChanged({
        previousFrontComponent: frontComponent,
        nextFrontComponent: {
          ...frontComponent,
          builtComponentChecksum: 'newer-component-checksum',
        },
      }),
    ).toBe(true);
  });

  it.each([
    ['is added', null, SHARED_DEPENDENCIES_CHECKSUM],
    ['is removed', SHARED_DEPENDENCIES_CHECKSUM, null],
    [
      'is replaced',
      SHARED_DEPENDENCIES_CHECKSUM,
      'newer-shared-dependencies-checksum',
    ],
  ])(
    'returns true when the shared dependencies checksum %s',
    (_label, previousChecksum, nextChecksum) => {
      expect(
        hasFrontComponentChecksumChanged({
          previousFrontComponent: {
            ...frontComponent,
            frontComponentSharedDependenciesChecksum: previousChecksum,
          },
          nextFrontComponent: {
            ...frontComponent,
            frontComponentSharedDependenciesChecksum: nextChecksum,
          },
        }),
      ).toBe(true);
    },
  );

  it('treats a missing and a null shared dependencies checksum as equal', () => {
    expect(
      hasFrontComponentChecksumChanged({
        previousFrontComponent: {
          builtComponentChecksum: frontComponent.builtComponentChecksum,
        },
        nextFrontComponent: {
          ...frontComponent,
          frontComponentSharedDependenciesChecksum: null,
        },
      }),
    ).toBe(false);
  });

  it.each([null, undefined])(
    'returns false when the next front component is %s',
    (nextFrontComponent) => {
      expect(
        hasFrontComponentChecksumChanged({
          previousFrontComponent: frontComponent,
          nextFrontComponent,
        }),
      ).toBe(false);
    },
  );
});
