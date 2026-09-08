import { i18n } from '@lingui/core';
import { afterEach, expect, it } from 'vitest';
import { messages } from '../locales/en';
import { noticeMessage } from '../notice-message';

afterEach(() => {
  i18n.load('en', messages);
  i18n.activate('en');
});
it('translates recording notifications without relying on their English wording', () => {
  i18n.load('fr', {
    'Recording ended. Twenty is processing your conversation.':
      'Enregistrement terminé.',
  });
  i18n.activate('fr');
  expect(noticeMessage({ type: 'recording-finished' })).toBe(
    'Enregistrement terminé.',
  );
});
it('interpolates a meeting title using the compiled source catalog', () => {
  i18n.load('en', messages);
  i18n.activate('en');
  expect(
    noticeMessage({ type: 'opening-meeting', title: 'Product demo' }),
  ).toBe(
    'Opening Product demo. Complete any meeting provider confirmation to enter.',
  );
});
