import { parsePath } from 'src/engine/api/rest/api-rest-query-builder/utils/path-parsers/parse-path.utils';

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

  it('should throw for wrong request path', () => {
    const request: any = { path: '/rest/companies/uuid/toto' };

    expect(() => parsePath(request)).toThrow(
      "Query path '/rest/companies/uuid/toto' invalid. Valid examples: /rest/companies/id or /rest/companies",
    );
  });
});
