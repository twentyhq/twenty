import { describe, expect, it } from 'vitest';

import { RESTRICTED_FIELD_PLACEHOLDER } from 'src/logic-functions/constants/restricted-field-placeholder';
import { type CallParticipantNode } from 'src/front-components/types/call-participant-node.type';
import { buildCallParticipantDisplayItems } from 'src/front-components/utils/build-call-participant-display-items.util';

const buildParticipant = (
  participant: Partial<CallParticipantNode> & { id: string },
): CallParticipantNode => ({
  handle: null,
  displayName: null,
  isOrganizer: false,
  personId: null,
  workspaceMemberId: null,
  person: null,
  workspaceMember: null,
  ...participant,
});

const matchedPerson = buildParticipant({
  id: 'participant-person',
  handle: 'ada@example.com',
  displayName: 'Ada from the invite',
  personId: 'person-ada',
  person: {
    id: 'person-ada',
    name: { firstName: 'Ada', lastName: 'Lovelace' },
    avatarUrl: 'https://example.com/legacy-avatar.png',
    avatarFile: [{ url: 'https://example.com/avatar.png' }],
  },
});

const workspaceMember = buildParticipant({
  id: 'participant-member',
  handle: 'grace@acme.com',
  workspaceMemberId: 'member-grace',
  workspaceMember: {
    id: 'member-grace',
    name: { firstName: 'Grace', lastName: 'Hopper' },
    avatarUrl: 'https://example.com/grace.png',
  },
});

const unmatchedWithName = buildParticipant({
  id: 'participant-unmatched-named',
  handle: 'linus@example.org',
  displayName: 'Linus',
});

const unmatchedWithHandleOnly = buildParticipant({
  id: 'participant-unmatched-handle',
  handle: 'margaret@example.org',
});

describe('buildCallParticipantDisplayItems', () => {
  it('renders a matched participant as a person with its record name and avatar', () => {
    const { items } = buildCallParticipantDisplayItems({
      participants: [matchedPerson],
      areRelationsLoaded: true,
      showUnmatchedAttendees: false,
    });

    expect(items).toEqual([
      {
        kind: 'person',
        key: 'person:person-ada',
        personId: 'person-ada',
        label: 'Ada Lovelace',
        avatarUrl: 'https://example.com/avatar.png',
        isOrganizer: false,
      },
    ]);
  });

  it('falls back to the attendee name when the person has no name', () => {
    const { items } = buildCallParticipantDisplayItems({
      participants: [
        buildParticipant({
          id: 'participant',
          handle: 'nameless@example.com',
          personId: 'person-nameless',
          person: { id: 'person-nameless', name: { firstName: ' ' } },
        }),
      ],
      areRelationsLoaded: true,
      showUnmatchedAttendees: false,
    });

    expect(items).toMatchObject([
      { kind: 'person', label: 'nameless@example.com', avatarUrl: undefined },
    ]);
  });

  it('prefers the matched person over the workspace member', () => {
    const { items } = buildCallParticipantDisplayItems({
      participants: [
        {
          ...matchedPerson,
          workspaceMemberId: 'member-ada',
          workspaceMember: {
            id: 'member-ada',
            name: { firstName: 'Ada (member)' },
          },
        },
      ],
      areRelationsLoaded: true,
      showUnmatchedAttendees: false,
    });

    expect(items).toMatchObject([
      { kind: 'person', personId: 'person-ada', label: 'Ada Lovelace' },
    ]);
  });

  it('shows workspace members by name even when unmatched attendees are hidden', () => {
    const { items, hiddenUnmatchedCount } = buildCallParticipantDisplayItems({
      participants: [workspaceMember],
      areRelationsLoaded: true,
      showUnmatchedAttendees: false,
    });

    expect(hiddenUnmatchedCount).toBe(0);
    expect(items).toEqual([
      {
        kind: 'workspaceMember',
        key: 'workspaceMember:member-grace',
        workspaceMemberId: 'member-grace',
        label: 'Grace Hopper',
        avatarUrl: 'https://example.com/grace.png',
        isOrganizer: false,
      },
    ]);
  });

  it('hides unmatched attendees by default and counts them', () => {
    const { items, hiddenUnmatchedCount } = buildCallParticipantDisplayItems({
      participants: [matchedPerson, unmatchedWithName, unmatchedWithHandleOnly],
      areRelationsLoaded: true,
      showUnmatchedAttendees: false,
    });

    expect(items.map((item) => item.kind)).toEqual(['person']);
    expect(hiddenUnmatchedCount).toBe(2);
  });

  it('shows unmatched attendees by display name, then handle, when enabled', () => {
    const { items, hiddenUnmatchedCount } = buildCallParticipantDisplayItems({
      participants: [unmatchedWithName, unmatchedWithHandleOnly],
      areRelationsLoaded: true,
      showUnmatchedAttendees: true,
    });

    expect(hiddenUnmatchedCount).toBe(0);
    expect(items).toEqual([
      {
        kind: 'unmatched',
        key: 'handle:linus@example.org',
        label: 'Linus',
        isOrganizer: false,
      },
      {
        kind: 'unmatched',
        key: 'handle:margaret@example.org',
        label: 'margaret@example.org',
        isOrganizer: false,
      },
    ]);
  });

  it('skips unmatched attendees with neither a name nor a handle', () => {
    const { items, hiddenUnmatchedCount } = buildCallParticipantDisplayItems({
      participants: [buildParticipant({ id: 'empty', displayName: '  ' })],
      areRelationsLoaded: true,
      showUnmatchedAttendees: true,
    });

    expect(items).toEqual([]);
    expect(hiddenUnmatchedCount).toBe(0);
  });

  it('keeps one chip per person and per email address', () => {
    const { items } = buildCallParticipantDisplayItems({
      participants: [
        matchedPerson,
        { ...matchedPerson, id: 'participant-person-other-handle' },
        unmatchedWithHandleOnly,
        {
          ...unmatchedWithHandleOnly,
          id: 'participant-unmatched-handle-uppercase',
          handle: 'MARGARET@example.org',
        },
      ],
      areRelationsLoaded: true,
      showUnmatchedAttendees: true,
    });

    expect(items.map((item) => item.key)).toEqual([
      'person:person-ada',
      'handle:margaret@example.org',
    ]);
  });

  it('lists the organizer first, then people, workspace members and unmatched attendees', () => {
    const { items } = buildCallParticipantDisplayItems({
      participants: [
        unmatchedWithName,
        workspaceMember,
        buildParticipant({
          id: 'participant-zoe',
          personId: 'person-zoe',
          person: { id: 'person-zoe', name: { firstName: 'Zoe' } },
        }),
        matchedPerson,
        { ...unmatchedWithHandleOnly, isOrganizer: true },
      ],
      areRelationsLoaded: true,
      showUnmatchedAttendees: true,
    });

    expect(items.map((item) => item.label)).toEqual([
      'margaret@example.org',
      'Ada Lovelace',
      'Zoe',
      'Grace Hopper',
      'Linus',
    ]);
  });

  it('does not link a participant whose person is deleted or unreadable', () => {
    const participantWithMissingPerson = buildParticipant({
      id: 'participant-missing-person',
      handle: 'gone@example.com',
      displayName: 'Gone Person',
      personId: 'person-deleted',
      person: null,
    });

    const hidden = buildCallParticipantDisplayItems({
      participants: [participantWithMissingPerson],
      areRelationsLoaded: true,
      showUnmatchedAttendees: false,
    });

    expect(hidden).toEqual({ items: [], hiddenUnmatchedCount: 1 });

    const shown = buildCallParticipantDisplayItems({
      participants: [participantWithMissingPerson],
      areRelationsLoaded: true,
      showUnmatchedAttendees: true,
    });

    expect(shown.items).toEqual([
      {
        kind: 'unmatched',
        key: 'handle:gone@example.com',
        label: 'Gone Person',
        isOrganizer: false,
      },
    ]);
  });

  it('falls back to the workspace member when the person is missing', () => {
    const { items } = buildCallParticipantDisplayItems({
      participants: [
        { ...workspaceMember, personId: 'person-deleted', person: null },
      ],
      areRelationsLoaded: true,
      showUnmatchedAttendees: false,
    });

    expect(items).toMatchObject([
      { kind: 'workspaceMember', label: 'Grace Hopper' },
    ]);
  });

  it('trusts participant ids and attendee names when relations could not be loaded', () => {
    const { items } = buildCallParticipantDisplayItems({
      participants: [
        buildParticipant({
          id: 'participant-person',
          handle: 'ada@example.com',
          displayName: 'Ada',
          personId: 'person-ada',
        }),
        buildParticipant({
          id: 'participant-member',
          handle: 'grace@acme.com',
          workspaceMemberId: 'member-grace',
        }),
      ],
      areRelationsLoaded: false,
      showUnmatchedAttendees: false,
    });

    expect(items).toEqual([
      {
        kind: 'person',
        key: 'person:person-ada',
        personId: 'person-ada',
        label: 'Ada',
        avatarUrl: undefined,
        isOrganizer: false,
      },
      {
        kind: 'workspaceMember',
        key: 'workspaceMember:member-grace',
        workspaceMemberId: 'member-grace',
        label: 'grace@acme.com',
        avatarUrl: undefined,
        isOrganizer: false,
      },
    ]);
  });

  it('still lists workspace members when every other attendee is hidden', () => {
    const { items, hiddenUnmatchedCount } = buildCallParticipantDisplayItems({
      participants: [workspaceMember, unmatchedWithName],
      areRelationsLoaded: true,
      showUnmatchedAttendees: false,
    });

    expect(items.map((item) => item.kind)).toEqual(['workspaceMember']);
    expect(hiddenUnmatchedCount).toBe(1);
  });

  it('ignores a restricted placeholder in the attendee name or email', () => {
    const { items } = buildCallParticipantDisplayItems({
      participants: [
        buildParticipant({
          id: 'participant-restricted-name',
          displayName: RESTRICTED_FIELD_PLACEHOLDER,
          handle: 'linus@example.org',
        }),
        buildParticipant({
          id: 'participant-restricted-both',
          displayName: RESTRICTED_FIELD_PLACEHOLDER,
          handle: RESTRICTED_FIELD_PLACEHOLDER,
        }),
      ],
      areRelationsLoaded: true,
      showUnmatchedAttendees: true,
    });

    expect(items).toEqual([
      {
        kind: 'unmatched',
        key: 'handle:linus@example.org',
        label: 'linus@example.org',
        isOrganizer: false,
      },
    ]);
  });
});
