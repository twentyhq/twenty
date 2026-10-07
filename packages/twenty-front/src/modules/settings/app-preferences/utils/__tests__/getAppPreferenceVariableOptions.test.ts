import { getAppPreferenceVariableOptions } from '@/settings/app-preferences/utils/getAppPreferenceVariableOptions';

describe('getAppPreferenceVariableOptions', () => {
  it('accepts labeled string options from the JSON metadata', () => {
    expect(
      getAppPreferenceVariableOptions([
        { label: 'ARR', value: 'arr' },
        { label: 'MRR', value: 'mrr' },
      ]),
    ).toEqual([
      { label: 'ARR', value: 'arr' },
      { label: 'MRR', value: 'mrr' },
    ]);
  });

  it.each([
    null,
    { label: 'Missing value' },
    { label: 'Number value', value: 2 },
    ['Invalid array'],
  ])('rejects malformed options without exposing a partial list', (option) => {
    expect(
      getAppPreferenceVariableOptions([{ label: 'ARR', value: 'arr' }, option]),
    ).toEqual([]);
  });

  it.each([null, undefined, 'ARR', { value: 'arr' }])(
    'returns no options for non-array metadata %s',
    (value) => {
      expect(getAppPreferenceVariableOptions(value)).toEqual([]);
    },
  );
});
