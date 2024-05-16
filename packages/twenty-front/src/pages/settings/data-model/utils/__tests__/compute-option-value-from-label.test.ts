import { computeOptionValueFromLabelOrThrow } from '~/pages/settings/data-model/utils/compute-option-value-from-label.utils';

describe('computeOptionValueFromLabel', () => {
  it('throws if empty label', () => {
    const label = ' ';

    expect(() => computeOptionValueFromLabelOrThrow(label)).toThrow();
  });

  it('computes name for 1 char long label', () => {
    const label = 'a';

    expect(computeOptionValueFromLabelOrThrow(label)).toEqual('a');
  });

  it('compute name if starts with digits', () => {
    const label = '1';

    expect(computeOptionValueFromLabelOrThrow(label)).toEqual('1');
  });

  it('computes name for label with non-latin char', () => {
    const label = 'λλλ';

    expect(computeOptionValueFromLabelOrThrow(label)).toEqual('lll');
  });
});
