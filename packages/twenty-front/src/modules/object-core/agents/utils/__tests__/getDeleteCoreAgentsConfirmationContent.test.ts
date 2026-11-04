import { getDeleteCoreAgentsConfirmationContent } from '@/object-core/agents/utils/getDeleteCoreAgentsConfirmationContent';
import { i18n } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

afterEach(() => {
  i18n.activate(SOURCE_LOCALE);
});

it('keeps the bulk confirmation token unchanged in another locale', () => {
  const confirmationToken = msg`DELETE`;
  i18n.load('fr-FR', {
    [confirmationToken.id]: 'localized-confirmation-token',
  });
  i18n.activate('fr-FR');

  const confirmation = getDeleteCoreAgentsConfirmationContent([
    'First agent',
    'Second agent',
  ]);

  expect(i18n._(confirmationToken)).toBe('localized-confirmation-token');
  expect(confirmation.confirmationValue).toBe('DELETE');
  expect(confirmation.subtitle).toContain('"DELETE"');
});
