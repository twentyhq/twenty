import { parse } from 'graphql';

import { extractTopLevelFieldsSafely } from 'src/engine/api/graphql/utils/extract-top-level-fields-safely.util';

describe('extractTopLevelFieldsSafely', () => {
  it('should return no field instead of throwing when the document is ambiguous', () => {
    const query = `
      query ReadPeople {
        findManyPeople {
          id
        }
      }
      mutation WipePeople {
        deleteManyPeople {
          id
        }
      }
    `;

    expect(extractTopLevelFieldsSafely(parse(query), undefined)).toEqual([]);
  });
});
