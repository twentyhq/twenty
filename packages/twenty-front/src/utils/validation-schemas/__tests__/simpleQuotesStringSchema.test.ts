import { i18n } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { type ZodSafeParseError } from 'zod';

import { simpleQuotesStringSchema } from '~/utils/validation-schemas/simpleQuotesStringSchema';

describe('simpleQuotesStringSchema', () => {
  afterEach(() => {
    i18n.activate(SOURCE_LOCALE);
  });

  it('validates a string with simple quotes', () => {
    const input = "'with simple quotes'";

    const result = simpleQuotesStringSchema.parse(input);

    expect(result).toBe(input);
  });

  it.each([
    ['no simple quotes'],
    ["'only at start"],
    ["only at end'"],
    ["mid'dle"],
    [''],
  ])('fails for strings not wrapped in simple quotes (%s)', (input) => {
    const result = simpleQuotesStringSchema.safeParse(input);

    expect(result.success).toBe(false);
    expect((result as ZodSafeParseError<string>).error.issues).toEqual([
      {
        code: 'custom',
        message: 'String should be wrapped in simple quotes',
        path: [],
      },
    ]);
  });

  it('uses the active locale when parsing an already imported schema', () => {
    const errorMessage = msg`String should be wrapped in simple quotes`;
    i18n.load('fr-FR', {
      [errorMessage.id]: 'Entourez le texte de guillemets simples',
    });

    i18n.activate(SOURCE_LOCALE);
    const sourceResult = simpleQuotesStringSchema.safeParse('unquoted');

    i18n.activate('fr-FR');
    const translatedResult = simpleQuotesStringSchema.safeParse('unquoted');

    expect(sourceResult.error?.issues[0].message).toBe(errorMessage.message);
    expect(translatedResult.error?.issues[0].message).toBe(
      'Entourez le texte de guillemets simples',
    );
  });
});
