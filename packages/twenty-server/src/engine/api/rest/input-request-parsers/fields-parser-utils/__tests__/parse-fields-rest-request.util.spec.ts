import { parseFieldsRestRequest } from 'src/engine/api/rest/input-request-parsers/fields-parser-utils/parse-fields-rest-request.util';
import { RestInputRequestParserException } from 'src/engine/api/rest/input-request-parsers/rest-input-request-parser.exception';

const buildArgs = (
  query: Parameters<typeof parseFieldsRestRequest>[0]['query'],
) => ({ query });

describe('parseFieldsRestRequest', () => {
  it('should return undefined when fields parameter is not provided', () => {
    expect(parseFieldsRestRequest(buildArgs({}))).toBeUndefined();
  });

  it('should parse comma-separated names, trim whitespace, ignore empty entries and deduplicate', () => {
    expect(
      parseFieldsRestRequest(
        buildArgs({ fields: ' name , emails , name ,, ' }),
      ),
    ).toEqual(new Set(['name', 'emails']));
  });

  it('should merge repeated fields parameters', () => {
    expect(
      parseFieldsRestRequest(buildArgs({ fields: ['name', 'emails,company'] })),
    ).toEqual(new Set(['name', 'emails', 'company']));
  });

  it('should throw when fields parameter is empty', () => {
    expect(() => parseFieldsRestRequest(buildArgs({ fields: '' }))).toThrow(
      RestInputRequestParserException,
    );
    expect(() => parseFieldsRestRequest(buildArgs({ fields: ' , ' }))).toThrow(
      "'fields' parameter is empty",
    );
  });

  it('should throw when fields parameter is not a list of strings', () => {
    expect(() =>
      parseFieldsRestRequest(buildArgs({ fields: { name: 'true' } })),
    ).toThrow(RestInputRequestParserException);
  });
});
