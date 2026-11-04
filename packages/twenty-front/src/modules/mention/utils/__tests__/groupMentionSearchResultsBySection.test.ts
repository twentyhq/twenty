import { AGENT_CHAT_ASSISTANT_MENTION_OBJECT_NAME_SINGULAR } from 'twenty-shared/ai';
import { StandardObjectNameSingular } from 'twenty-shared/types';

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
      buildResult('Acme', StandardObjectNameSingular.Company),
      buildResult('Grace', StandardObjectNameSingular.WorkspaceMember),
      buildResult('Ada', StandardObjectNameSingular.Person),
      buildResult('Phil', StandardObjectNameSingular.WorkspaceMember),
      buildResult('Globex', StandardObjectNameSingular.Company),
      buildResult('Tim', StandardObjectNameSingular.WorkspaceMember),
    ];

    expect(
      groupMentionSearchResultsBySection(items).map(({ label }) => label),
    ).toEqual(['Grace', 'Phil', 'Tim', 'Acme', 'Globex', 'Ada']);
  });

  it('puts the assistant before teammates', () => {
    const items = [
      buildResult('Grace', StandardObjectNameSingular.WorkspaceMember),
      buildResult('Acme', StandardObjectNameSingular.Company),
      buildResult(
        'Assistant',
        AGENT_CHAT_ASSISTANT_MENTION_OBJECT_NAME_SINGULAR,
      ),
    ];

    expect(
      groupMentionSearchResultsBySection(items).map(({ label }) => label),
    ).toEqual(['Assistant', 'Grace', 'Acme']);
  });
});
