import { hasFrontComponentChecksumChanged } from '@/front-components/utils/hasFrontComponentChecksumChanged';

const frontComponent = {
  builtComponentChecksum: 'component-checksum',
  frontComponentSharedDependenciesChecksum: 'shared-dependencies-checksum',
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

  it('returns true when the shared dependencies checksum changed', () => {
    expect(
      hasFrontComponentChecksumChanged({
        previousFrontComponent: {
          ...frontComponent,
          frontComponentSharedDependenciesChecksum: null,
        },
        nextFrontComponent: frontComponent,
      }),
    ).toBe(true);
  });

  it.each([
    ['the previous front component is missing', undefined, frontComponent],
    ['the next front component is missing', frontComponent, null],
  ])(
    'returns false when %s',
    (_label, previousFrontComponent, nextFrontComponent) => {
      expect(
        hasFrontComponentChecksumChanged({
          previousFrontComponent,
          nextFrontComponent,
        }),
      ).toBe(false);
    },
  );
});
