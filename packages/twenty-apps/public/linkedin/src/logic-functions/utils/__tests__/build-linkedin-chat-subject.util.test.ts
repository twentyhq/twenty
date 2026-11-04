import { describe, expect, it } from 'vitest';

import { buildLinkedinChatSubject } from 'src/logic-functions/utils/build-linkedin-chat-subject.util';

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

describe('buildLinkedinChatSubject', () => {
  it('uses the other person in a one-to-one chat', () => {
    expect(
      buildLinkedinChatSubject({
        id: 'chat',
        name: 'ignored',
        is_group: false,
        is_1to1: true,
        user: buildUser('Daphné Müller'),
      }),
    ).toBe('Daphné Müller');
  });

  it('uses the name LinkedIn gives a group', () => {
    expect(
      buildLinkedinChatSubject(buildGroup(['Ada', 'Bob'], ' Q4 hiring ')),
    ).toBe('Q4 hiring');
  });

  it('lists the members of an unnamed group', () => {
    expect(buildLinkedinChatSubject(buildGroup(['Ada', 'Bob']))).toBe(
      'Ada, Bob',
    );
    expect(
      buildLinkedinChatSubject(buildGroup(['Ada', 'Bob', 'Cleo', 'Dan'])),
    ).toBe('Ada, Bob +2');
  });
});
