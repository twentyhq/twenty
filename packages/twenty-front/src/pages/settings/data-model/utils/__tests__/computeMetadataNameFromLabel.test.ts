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

  it('adds "Custom" suffix to reserved keywords', () => {
    expect(computeMetadataNameFromLabel('Plan')).toEqual('planCustom');
    expect(computeMetadataNameFromLabel('Event')).toEqual('eventCustom');
    expect(computeMetadataNameFromLabel('User')).toEqual('userCustom');
  });

  it('adds "Custom" suffix to plural reserved keywords', () => {
    expect(computeMetadataNameFromLabel('Plans')).toEqual('plansCustom');
    expect(computeMetadataNameFromLabel('Events')).toEqual('eventsCustom');
  });

  it('does not modify non-reserved keywords', () => {
    expect(computeMetadataNameFromLabel('Customer')).toEqual('customer');
    expect(computeMetadataNameFromLabel('Order')).toEqual('order');
  });
});
