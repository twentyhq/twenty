import { describe, expect, it } from 'vitest';

import { buildWorkspaceMemberSearchFilter } from 'src/front-components/utils/build-workspace-member-search-filter.util';

describe('buildWorkspaceMemberSearchFilter', () => {
  it('matches a single word against first and last name', () => {
    expect(buildWorkspaceMemberSearchFilter('ada')).toBe(
      'or(name.firstName[ilike]:%ada%,name.lastName[ilike]:%ada%)',
    );
  });

  it('requires every word of a full name to match a name part', () => {
    expect(buildWorkspaceMemberSearchFilter('Ada Lovelace')).toBe(
      'and(or(name.firstName[ilike]:%Ada%,name.lastName[ilike]:%Ada%),or(name.firstName[ilike]:%Lovelace%,name.lastName[ilike]:%Lovelace%))',
    );
  });

  it('strips filter-breaking characters and treats them as separators', () => {
    expect(buildWorkspaceMemberSearchFilter('Lovelace,Ada')).toBe(
      'and(or(name.firstName[ilike]:%Lovelace%,name.lastName[ilike]:%Lovelace%),or(name.firstName[ilike]:%Ada%,name.lastName[ilike]:%Ada%))',
    );
  });

  it('returns undefined when nothing searchable remains', () => {
    expect(buildWorkspaceMemberSearchFilter('  %_() ')).toBeUndefined();
    expect(buildWorkspaceMemberSearchFilter('')).toBeUndefined();
  });
});
