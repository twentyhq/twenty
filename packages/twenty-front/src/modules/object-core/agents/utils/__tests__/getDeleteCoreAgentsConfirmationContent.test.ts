import { getDeleteCoreAgentsConfirmationContent } from '@/object-core/agents/utils/getDeleteCoreAgentsConfirmationContent';
import { i18n } from '@lingui/core';
import { generateMessageId } from 'twenty-shared/i18n';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

afterEach(() => {
  i18n.activate(SOURCE_LOCALE);
});

it('keeps the bulk confirmation token unchanged in another locale', () => {
  const confirmationTokenId = generateMessageId('DELETE');
  i18n.load('fr-FR', {
    [confirmationTokenId]: 'localized-confirmation-token',
  });
  i18n.activate('fr-FR');

  const confirmation = getDeleteCoreAgentsConfirmationContent([
    'First agent',
    'Second agent',
  ]);

  expect(i18n._(confirmationTokenId)).toBe('localized-confirmation-token');
  expect(confirmation.confirmationValue).toBe('DELETE');
  expect(confirmation.subtitle).toContain('"DELETE"');
});
