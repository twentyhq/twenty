import { normalizeStepModelConfiguration } from 'src/database/commands/upgrade-version-command/2-55/utils/normalize-step-model-configuration.util';

describe('normalizeStepModelConfiguration', () => {
  it('keeps only whether each native tool is on', () => {
    expect(
      normalizeStepModelConfiguration({
        webSearch: { enabled: true, configuration: { maxUses: 2 } },
      }),
    ).toEqual({ webSearch: { enabled: true } });
  });

  it('gives nothing without a native tool setting', () => {
    expect(normalizeStepModelConfiguration(null)).toBeNull();
    expect(normalizeStepModelConfiguration({})).toBeNull();
  });
});
