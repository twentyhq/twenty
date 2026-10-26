import { getApplicationLogFunctionOrEventLabel } from '@/settings/application-monitoring/utils/getApplicationLogFunctionOrEventLabel';

describe('getApplicationLogFunctionOrEventLabel', () => {
  it('should prefer the function name', () => {
    expect(
      getApplicationLogFunctionOrEventLabel({
        logicFunctionName: 'syncContacts',
        source: 'LOGIC_FUNCTION',
      }),
    ).toBe('syncContacts');
  });

  it('should fall back to the source label, then the raw source', () => {
    expect(
      getApplicationLogFunctionOrEventLabel({
        logicFunctionName: '',
        source: 'UPGRADE',
      }),
    ).toBe('Upgrade');
    expect(
      getApplicationLogFunctionOrEventLabel({
        logicFunctionName: '',
        source: 'UNKNOWN_SOURCE',
      }),
    ).toBe('UNKNOWN_SOURCE');
  });
});
