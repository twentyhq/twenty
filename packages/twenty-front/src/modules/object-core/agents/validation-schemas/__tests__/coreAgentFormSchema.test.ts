import { coreAgentFormSchema } from '@/object-core/agents/validation-schemas/coreAgentFormSchema';
import { i18n } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

describe('coreAgentFormSchema', () => {
  afterEach(() => {
    i18n.activate(SOURCE_LOCALE);
  });

  it('uses the active locale when validating an already imported schema', () => {
    const errorMessage = msg`Model is required`;
    i18n.load('fr-FR', { [errorMessage.id]: 'Le modèle est requis' });

    i18n.activate(SOURCE_LOCALE);
    const sourceMessage =
      coreAgentFormSchema.shape.modelId.safeParse('').error?.issues[0].message;

    i18n.activate('fr-FR');
    const translatedMessage =
      coreAgentFormSchema.shape.modelId.safeParse('').error?.issues[0].message;

    expect(sourceMessage).toBe(errorMessage.message);
    expect(translatedMessage).toBe('Le modèle est requis');
  });
});
