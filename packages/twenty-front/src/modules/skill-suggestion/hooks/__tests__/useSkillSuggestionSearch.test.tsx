import { renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';

import { useSkillSuggestionSearch } from '@/skill-suggestion/hooks/useSkillSuggestionSearch';
import { FindManySkillsForSuggestionDocument } from '~/generated-metadata/graphql';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const buildSkill = ({
  id,
  name,
  label,
  isSystem = false,
  isActive = true,
}: {
  id: string;
  name: string;
  label: string;
  isSystem?: boolean;
  isActive?: boolean;
}) => ({
  __typename: 'Skill' as const,
  id,
  name,
  label,
  description: null,
  icon: 'IconBook',
  isActive,
  isSystem,
});

const MEETING_PREP_SKILL = buildSkill({
  id: '20202020-5e21-4b07-9c3a-1d4f6e8a0b52',
  name: 'meeting-prep',
  label: 'Meeting Prep',
});

const VIEW_BUILDING_SKILL = buildSkill({
  id: '20202020-e4a2-4b3f-9c71-d8f6a2b51e3a',
  name: 'view-building',
  label: 'View Building',
  isSystem: true,
});

const DEACTIVATED_SKILL = buildSkill({
  id: '20202020-6c5d-4e3f-9a8b-7d6e5f4c3b21',
  name: 'quarterly-report',
  label: 'Quarterly Report',
  isActive: false,
});

const renderUseSkillSuggestionSearch = () => {
  const Wrapper = getJestMetadataAndApolloMocksWrapper({
    apolloMocks: [
      {
        request: { query: FindManySkillsForSuggestionDocument },
        result: {
          data: {
            skills: [
              MEETING_PREP_SKILL,
              VIEW_BUILDING_SKILL,
              DEACTIVATED_SKILL,
            ],
          },
        },
        maxUsageCount: Number.POSITIVE_INFINITY,
      },
    ],
  });

  return renderHook(() => useSkillSuggestionSearch(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <Wrapper>{children}</Wrapper>
    ),
  });
};

describe('useSkillSuggestionSearch', () => {
  it('offers the skills a user can pick', async () => {
    const { result } = renderUseSkillSuggestionSearch();

    const skills = await result.current.searchSkills('');

    expect(skills.map((skill) => skill.name)).toEqual(['meeting-prep']);
  });

  it('never offers a system skill, even when the query names it', async () => {
    const { result } = renderUseSkillSuggestionSearch();

    const skills = await result.current.searchSkills('view-building');

    expect(skills).toEqual([]);
  });
});
