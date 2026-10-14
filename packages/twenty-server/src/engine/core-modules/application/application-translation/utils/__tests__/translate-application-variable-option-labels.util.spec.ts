import { generateMessageId } from 'twenty-shared/i18n';

import { translateApplicationVariableOptionLabels } from 'src/engine/core-modules/application/application-translation/utils/translate-application-variable-option-labels.util';

const options = [
  { value: 'eu', label: 'Europe' },
  { value: 'us', label: 'United States' },
];

describe('translateApplicationVariableOptionLabels', () => {
  it('translates the labels the catalog holds under the owner context', () => {
    expect(
      translateApplicationVariableOptionLabels({
        owner: 'applicationVariable',
        options,
        applicationCatalog: {
          [generateMessageId('Europe', 'applicationVariable.label')]: 'Europa',
        },
      }),
    ).toEqual([
      { value: 'eu', label: 'Europa' },
      { value: 'us', label: 'United States' },
    ]);
  });

  it('ignores catalog entries authored under another owner context', () => {
    expect(
      translateApplicationVariableOptionLabels({
        owner: 'serverVariable',
        options,
        applicationCatalog: {
          [generateMessageId('Europe', 'applicationVariable.label')]: 'Europa',
        },
      }),
    ).toEqual(options);
  });

  it('keeps options untouched without a catalog', () => {
    expect(
      translateApplicationVariableOptionLabels({
        owner: 'serverVariable',
        options: null,
        applicationCatalog: {},
      }),
    ).toBeNull();
    expect(
      translateApplicationVariableOptionLabels({
        owner: 'serverVariable',
        options,
        applicationCatalog: undefined,
      }),
    ).toEqual(options);
  });
});
