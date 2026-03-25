import { parseViewIdRestRequest } from 'src/engine/api/rest/input-request-parsers/view-id-parser-utils/parse-view-id-rest-request.util';

describe('parseViewIdRestRequest', () => {
  it('should return undefined if viewId missing', () => {
    const request: any = { query: {} };

    expect(parseViewIdRestRequest(request)).toBeUndefined();
  });

  it('should return viewId when provided as string', () => {
    const request: any = {
      query: { viewId: '20202020-e29b-41d4-a716-446655440000' },
    };

    expect(parseViewIdRestRequest(request)).toEqual(
      '20202020-e29b-41d4-a716-446655440000',
    );
  });
});
