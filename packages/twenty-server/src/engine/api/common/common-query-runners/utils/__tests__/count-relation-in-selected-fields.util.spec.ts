import { countRelationInSelectedFields } from 'src/engine/api/common/common-query-runners/utils/count-relation-in-selected-fields.util';

describe('countRelationInSelectedFields', () => {
  it('returns 0 when relations object is empty', () => {
    const relations = {};

    const result = countRelationInSelectedFields(relations);

    expect(result).toBe(0);
  });

  it('counts flat relations without nesting', () => {
    const relations = {
      company: true,
      contact: true,
      opportunity: true,
    };

    const result = countRelationInSelectedFields(relations);

    expect(result).toBe(3);
  });

  it('recursively counts nested relations', () => {
    const relations = {
      company: {
        people: true,
        opportunities: {
          tasks: true,
        },
      },
      contact: true,
    };

    const result = countRelationInSelectedFields(relations);

    expect(result).toBe(5);
  });
});
