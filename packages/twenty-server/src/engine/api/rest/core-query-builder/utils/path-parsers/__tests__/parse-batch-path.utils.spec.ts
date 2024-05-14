import { parseBatchPath } from 'src/engine/api/rest/core-query-builder/utils/path-parsers/parse-batch-path.utils';

describe('parseBatchPath', () => {
  it('should parse object from request path', () => {
    const request: any = { path: '/rest/batch/companies' };

    expect(parseBatchPath(request)).toEqual({
      object: 'companies',
    });
  });
});
