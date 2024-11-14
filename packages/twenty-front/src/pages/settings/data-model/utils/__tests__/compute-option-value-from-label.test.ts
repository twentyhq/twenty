import { computeOptionValueFromLabel } from '~/pages/settings/data-model/utils/compute-option-value-from-label.utils';

describe('computeOptionValueFromLabel', () => {
  it('throws if empty label', () => {
    const label = ' ';

    expect(() => computeOptionValueFromLabel(label)).toThrow();
  });

  it('computes name for 1 char long label', () => {
    const label = 'a';

    expect(computeOptionValueFromLabel(label)).toEqual('a');
  });

  it('compute name if starts with digits', () => {
    const label = '1';

    expect(computeOptionValueFromLabel(label)).toEqual('1');
  });

  it('computes name for label with non-latin char', () => {
    const label = 'λλλ';

    expect(computeOptionValueFromLabel(label)).toEqual('lll');
  });
});
