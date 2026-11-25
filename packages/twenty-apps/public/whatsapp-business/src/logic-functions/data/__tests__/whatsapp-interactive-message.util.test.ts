import { describe, expect, it } from 'vitest';
import { buildWhatsAppInteractiveContent } from 'src/logic-functions/data/build-whatsapp-interactive-content.util';
import { formatWhatsAppInteractiveText } from 'src/logic-functions/data/format-whatsapp-interactive-text.util';

const BUTTONS_MESSAGE = {
  body: 'Can we call you tomorrow?',
  footer: 'Reply anytime',
  buttons: [{ title: 'Yes' }, { id: 'later', title: 'Next week' }],
};

const LIST_MESSAGE = {
  body: 'Pick a slot',
  list: {
    buttonText: 'Slots',
    sections: [{ title: 'Monday', rows: [{ title: '9:00' }, { title: '14:00', description: 'After lunch' }] }],
  },
};

describe('buildWhatsAppInteractiveContent', () => {
  it('should build reply buttons with default ids', () => {
    expect(buildWhatsAppInteractiveContent(BUTTONS_MESSAGE)).toEqual({
      type: 'button',
      body: { text: 'Can we call you tomorrow?' },
      footer: { text: 'Reply anytime' },
      action: {
        buttons: [
          { type: 'reply', reply: { id: 'option-1', title: 'Yes' } },
          { type: 'reply', reply: { id: 'later', title: 'Next week' } },
        ],
      },
    });
  });

  it('should build a list with ids numbered across sections', () => {
    expect(buildWhatsAppInteractiveContent(LIST_MESSAGE)).toEqual({
      type: 'list',
      body: { text: 'Pick a slot' },
      action: {
        button: 'Slots',
        sections: [
          {
            title: 'Monday',
            rows: [
              { id: 'option-1', title: '9:00' },
              { id: 'option-2', title: '14:00', description: 'After lunch' },
            ],
          },
        ],
      },
    });
  });
});

describe('formatWhatsAppInteractiveText', () => {
  it('should store the message with the options offered', () => {
    expect(formatWhatsAppInteractiveText(LIST_MESSAGE)).toBe('Pick a slot\n\n• 9:00\n• 14:00 - After lunch');
  });
});
