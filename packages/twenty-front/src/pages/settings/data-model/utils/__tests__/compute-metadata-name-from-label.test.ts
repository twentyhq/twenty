import { computeMetadataNameFromLabel } from '~/pages/settings/data-model/utils/compute-metadata-name-from-label.utils';

describe('computeMetadataNameFromLabel', () => {
  it('computes name for label with non-latin char', () => {
    const label = 'λλλ!';

    expect(computeMetadataNameFromLabel(label)).toEqual('lll');
  });
});
