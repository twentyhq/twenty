import { convertFlatVariablesToNestedContext } from '@/workflow/workflow-steps/utils/convertFlatVariablesToNestedContext';

describe('convertFlatVariablesToNestedContext', () => {
  it('nests dotted variable paths into a context object', () => {
    expect(
      convertFlatVariablesToNestedContext({
        'trigger.properties.after.name': 'Acme',
        'trigger.properties.after.employees': '12',
        'step-1.result.total': '2',
      }),
    ).toEqual({
      trigger: { properties: { after: { name: 'Acme', employees: '12' } } },
      'step-1': { result: { total: '2' } },
    });
  });

  it('replaces a scalar parent when a deeper path needs an object there', () => {
    expect(
      convertFlatVariablesToNestedContext({
        trigger: 'Acme',
        'trigger.name': 'Acme',
      }),
    ).toEqual({ trigger: { name: 'Acme' } });
  });
});
