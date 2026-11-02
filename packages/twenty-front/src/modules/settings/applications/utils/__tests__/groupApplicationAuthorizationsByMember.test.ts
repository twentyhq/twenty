import { groupApplicationAuthorizationsByMember } from '@/settings/applications/utils/groupApplicationAuthorizationsByMember';

describe('groupApplicationAuthorizationsByMember', () => {
  it('gives each member one group, keeping the order the grants came in', () => {
    const janeSharedGrant = { id: 'jane-shared', userId: 'jane' };
    const jonyGrant = { id: 'jony', userId: 'jony' };
    const janeLegacyGrant = { id: 'jane-legacy', userId: 'jane' };

    expect(
      groupApplicationAuthorizationsByMember([
        janeSharedGrant,
        jonyGrant,
        janeLegacyGrant,
      ]),
    ).toEqual([[janeSharedGrant, janeLegacyGrant], [jonyGrant]]);
  });
});
