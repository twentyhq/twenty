import { computeMetadataNameFromLabelOrThrow } from '~/pages/settings/data-model/utils/compute-metadata-name-from-label.utils';

describe('computeMetadataNameFromLabel', () => {
  it('throws if empty label', () => {
    const label = ' ';

    expect(() => computeMetadataNameFromLabelOrThrow(label)).toThrow();
  });

  it('computes name for 1 char long label', () => {
    const label = 'a';

    expect(computeMetadataNameFromLabelOrThrow(label)).toEqual('a');
  });

  it('throws if label starts with digits', () => {
    const label = '1string';

    expect(() => computeMetadataNameFromLabelOrThrow(label)).toThrow();
  });

  it('computes name for label with non-latin char', () => {
    const label = 'λλλ!';

    expect(computeMetadataNameFromLabelOrThrow(label)).toEqual('lll');
  });
});
