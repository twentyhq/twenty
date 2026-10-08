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

  it('keeps the marks that appear inside real names', () => {
    expect(buildWorkspaceMemberSearchFilter("O'Brien")).toBe(
      "or(name.firstName[ilike]:%O'Brien%,name.lastName[ilike]:%O'Brien%)",
    );
    expect(buildWorkspaceMemberSearchFilter('Jean-Luc')).toBe(
      'or(name.firstName[ilike]:%Jean-Luc%,name.lastName[ilike]:%Jean-Luc%)',
    );
    expect(buildWorkspaceMemberSearchFilter('Ada Lovelace')).toContain('Ada');
  });

  it('drops characters that could reach the query string or the filter grammar', () => {
    expect(buildWorkspaceMemberSearchFilter('ada&limit=1000')).toBe(
      'and(or(name.firstName[ilike]:%ada%,name.lastName[ilike]:%ada%),or(name.firstName[ilike]:%limit%,name.lastName[ilike]:%limit%),or(name.firstName[ilike]:%1000%,name.lastName[ilike]:%1000%))',
    );
  });

  it('returns undefined when nothing searchable remains', () => {
    expect(buildWorkspaceMemberSearchFilter('  %_() ')).toBeUndefined();
    expect(buildWorkspaceMemberSearchFilter('')).toBeUndefined();
  });
});
