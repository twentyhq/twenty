import { CoreObjectNameSingular } from 'twenty-shared/types';

import type { MentionSearchResult } from '@/mention/types/MentionSearchResult';
import { groupMentionSearchResultsBySection } from '@/mention/utils/groupMentionSearchResultsBySection';

const buildResult = (
  label: string,
  objectNameSingular: string,
): MentionSearchResult => ({
  recordId: `${label}-id`,
  objectNameSingular,
  objectLabelSingular: objectNameSingular,
  objectLabelPlural: objectNameSingular,
  label,
  imageUrl: '',
});

describe('groupMentionSearchResultsBySection', () => {
  it('puts teammates first and groups records by object in rank order', () => {
    const items = [
      buildResult('Acme', CoreObjectNameSingular.Company),
      buildResult('Grace', CoreObjectNameSingular.WorkspaceMember),
      buildResult('Ada', CoreObjectNameSingular.Person),
      buildResult('Phil', CoreObjectNameSingular.WorkspaceMember),
      buildResult('Globex', CoreObjectNameSingular.Company),
      buildResult('Tim', CoreObjectNameSingular.WorkspaceMember),
    ];

    expect(
      groupMentionSearchResultsBySection(items).map(({ label }) => label),
    ).toEqual(['Grace', 'Phil', 'Tim', 'Acme', 'Globex', 'Ada']);
  });
});
