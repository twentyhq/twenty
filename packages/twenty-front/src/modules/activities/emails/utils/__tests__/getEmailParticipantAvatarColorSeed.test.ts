import { getEmailParticipantAvatarColorSeed } from '@/activities/emails/utils/getEmailParticipantAvatarColorSeed';

describe('getEmailParticipantAvatarColorSeed', () => {
  it('uses the person ID consistently across participant shapes', () => {
    expect(
      getEmailParticipantAvatarColorSeed({
        personId: 'person-id',
        workspaceMemberId: 'workspace-member-id',
      }),
    ).toBe('person-id');

    expect(
      getEmailParticipantAvatarColorSeed({
        person: { id: 'person-id' },
        workspaceMember: { id: 'workspace-member-id' },
      }),
    ).toBe('person-id');
  });

  it('falls back to the workspace member ID', () => {
    expect(
      getEmailParticipantAvatarColorSeed({
        workspaceMemberId: 'workspace-member-id',
      }),
    ).toBe('workspace-member-id');

    expect(
      getEmailParticipantAvatarColorSeed({
        workspaceMember: { id: 'workspace-member-id' },
      }),
    ).toBe('workspace-member-id');
  });

  it('falls back to the normalized handle, then the display name', () => {
    expect(
      getEmailParticipantAvatarColorSeed({
        handle: ' Person@Example.com ',
        displayName: 'Person',
      }),
    ).toBe('person@example.com');

    expect(
      getEmailParticipantAvatarColorSeed({
        displayName: 'Person',
      }),
    ).toBe('Person');
  });
});
