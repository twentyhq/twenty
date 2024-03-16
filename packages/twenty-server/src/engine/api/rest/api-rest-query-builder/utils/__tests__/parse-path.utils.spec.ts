import { parsePath } from 'src/engine/api/rest/api-rest-query-builder/utils/parse-path.utils';

describe('parsePath', () => {
  it('should parse object from request path', () => {
    const request: any = { path: '/rest/companies/uuid' };

    expect(parsePath(request)).toEqual({
      object: 'companies',
      id: 'uuid',
    });
  });

  it('should parse object from request path', () => {
    const request: any = { path: '/rest/companies' };

    expect(parsePath(request)).toEqual({
      object: 'companies',
      id: undefined,
    });
  });
});
