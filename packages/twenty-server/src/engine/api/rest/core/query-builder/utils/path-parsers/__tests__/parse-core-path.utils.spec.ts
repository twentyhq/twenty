import { parseCorePath } from 'src/engine/api/rest/core/query-builder/utils/path-parsers/parse-core-path.utils';

describe('parseCorePath', () => {
  it('should parse object from request path', () => {
    const request: any = { path: '/rest/companies/uuid' };

    expect(parseCorePath(request)).toEqual({
      object: 'companies',
      id: 'uuid',
    });
  });

  it('should parse object from request path', () => {
    const request: any = { path: '/rest/companies' };

    expect(parseCorePath(request)).toEqual({
      object: 'companies',
      id: undefined,
    });
  });

  it('should throw for wrong request path', () => {
    const request: any = { path: '/rest/companies/uuid/toto' };

    expect(() => parseCorePath(request)).toThrow(
      "Query path '/rest/companies/uuid/toto' invalid. Valid examples: /rest/companies/id or /rest/companies or /rest/batch/companies",
    );
  });

  it('should parse object from batch request', () => {
    const request: any = { path: '/rest/batch/companies' };

    expect(parseCorePath(request)).toEqual({
      object: 'companies',
      id: undefined,
    });
  });

  it('should throw for wrong batch request', () => {
    const request: any = { path: '/rest/batch/companies/uuid' };

    expect(() => parseCorePath(request)).toThrow(
      "Query path '/rest/batch/companies/uuid' invalid. Valid examples: /rest/companies/id or /rest/companies or /rest/batch/companies",
    );
  });
});
