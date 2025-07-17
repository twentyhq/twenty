import { parseMetadataPath } from 'src/engine/api/rest/metadata/query-builder/utils/parse-metadata-path.utils';

describe('parseMetadataPath', () => {
  it('should parse object from request path with uuid', () => {
    const request: any = { path: '/rest/metadata/fields/uuid' };

    expect(parseMetadataPath(request.path)).toEqual({
      objectNameSingular: 'field',
      objectNamePlural: 'fields',
      id: 'uuid',
    });
  });

  it('should parse object from request path', () => {
    const request: any = { path: '/rest/metadata/fields' };

    expect(parseMetadataPath(request.path)).toEqual({
      objectNameSingular: 'field',
      objectNamePlural: 'fields',
      id: undefined,
    });
  });

  it('should throw for wrong request path', () => {
    const request: any = { path: '/rest/metadata/INVALID' };

    expect(() => parseMetadataPath(request.path)).toThrow(
      'Query path \'/rest/metadata/INVALID\' invalid. Metadata path "INVALID" does not exist. Valid examples: /rest/metadata/fields or /rest/metadata/objects',
    );
  });

  it('should throw for wrong request path', () => {
    const request: any = { path: '/rest/metadata/fields/uuid/toto' };

    expect(() => parseMetadataPath(request.path)).toThrow(
      "Query path '/rest/metadata/fields/uuid/toto' invalid. Valid examples: /rest/metadata/fields or /rest/metadata/objects/id",
    );
  });
});
