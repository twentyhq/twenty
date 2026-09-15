import { findSimilarToolNames } from 'src/engine/core-modules/tool-provider/utils/find-similar-tool-names.util';

describe('findSimilarToolNames', () => {
  const catalog = [
    'find_many_people',
    'find_one_person',
    'group_by_people',
    'group_by_companies',
    'create_one_person',
    'update_many_people',
  ];

  it('ranks the plural variant first for a singular group_by name', () => {
    const suggestions = findSimilarToolNames('group_by_person', catalog);

    expect(suggestions).toContain('group_by_people');
    expect(suggestions[0]).toBe('group_by_people');
  });

  it('ranks the plural variant first for a singular find_many name', () => {
    const suggestions = findSimilarToolNames('find_many_person', catalog);

    expect(suggestions[0]).toBe('find_many_people');
  });

  it('ranks the closest candidate first for a typo', () => {
    expect(findSimilarToolNames('group_by_peple', catalog)[0]).toBe(
      'group_by_people',
    );
  });

  it('returns an empty array when nothing is close enough', () => {
    expect(findSimilarToolNames('send_email', catalog)).toEqual([]);
  });

  it('never suggests an exact match', () => {
    expect(findSimilarToolNames('group_by_people', catalog)).not.toContain(
      'group_by_people',
    );
  });

  it('caps the number of suggestions at three', () => {
    const manyCandidates = [
      'find_many_opportunities',
      'find_many_opportunity',
      'find_many_opportunitiez',
      'find_many_oportunities',
      'find_many_opportunitis',
    ];

    expect(
      findSimilarToolNames('find_many_opportunites', manyCandidates),
    ).toHaveLength(3);
  });

  it('handles an empty catalog', () => {
    expect(findSimilarToolNames('group_by_person', [])).toEqual([]);
  });
});
