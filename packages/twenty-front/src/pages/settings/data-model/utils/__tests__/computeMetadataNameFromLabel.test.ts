import { computeMetadataNameFromLabel } from '~/pages/settings/data-model/utils/computeMetadataNameFromLabel';

describe('computeMetadataNameFromLabel', () => {
  it('computes name for label with non-latin char', () => {
    const label = 'λλλ!';

    expect(computeMetadataNameFromLabel(label)).toEqual('lll');
  });

  it('returns empty string for empty label', () => {
    const label = '';

    expect(computeMetadataNameFromLabel(label)).toEqual('');
  });

  it('returns empty string for invalid label', () => {
    const label = '/';

    expect(computeMetadataNameFromLabel(label)).toEqual('');
  });
});
