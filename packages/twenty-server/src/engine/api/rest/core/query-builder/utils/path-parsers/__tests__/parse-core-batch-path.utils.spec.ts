import { parseCoreBatchPath } from 'src/engine/api/rest/core/query-builder/utils/path-parsers/parse-core-batch-path.utils';

describe('parseCoreBatchPath', () => {
  it('should parse object from request path', () => {
    const request: any = { path: '/rest/batch/companies' };

    expect(parseCoreBatchPath(request)).toEqual({
      object: 'companies',
    });
  });
});
