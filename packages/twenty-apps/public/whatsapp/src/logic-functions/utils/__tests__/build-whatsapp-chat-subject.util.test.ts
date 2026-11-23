import { describe, expect, it } from 'vitest';

import { buildWhatsappChatSubject } from 'src/logic-functions/utils/build-whatsapp-chat-subject.util';

const buildUser = (name: string) => ({ id: name, display_name: name });

const buildGroup = (names: string[], name = '') => ({
  id: 'chat',
  name,
  is_group: true,
  is_1to1: false,
  participants: names.map((participantName) => ({
    is_self: false,
    user: buildUser(participantName),
  })),
});

describe('buildWhatsappChatSubject', () => {
  it('uses the other person in a one-to-one chat', () => {
    expect(
      buildWhatsappChatSubject({
        id: 'chat',
        name: 'ignored',
        is_group: false,
        is_1to1: true,
        user: buildUser('Daphné Müller'),
      }),
    ).toBe('Daphné Müller');
  });

  it('uses the name WhatsApp gives a group', () => {
    expect(
      buildWhatsappChatSubject(buildGroup(['Ada', 'Bob'], ' Q4 hiring ')),
    ).toBe('Q4 hiring');
  });

  it('lists the members of an unnamed group', () => {
    expect(buildWhatsappChatSubject(buildGroup(['Ada', 'Bob']))).toBe(
      'Ada, Bob',
    );
    expect(
      buildWhatsappChatSubject(buildGroup(['Ada', 'Bob', 'Cleo', 'Dan'])),
    ).toBe('Ada, Bob +2');
  });
});
