import { parseFieldsRestRequest } from 'src/engine/api/rest/input-request-parsers/fields-parser-utils/parse-fields-rest-request.util';
import { RestInputRequestParserException } from 'src/engine/api/rest/input-request-parsers/rest-input-request-parser.exception';

type ParseFieldsRestRequestArgs = Parameters<typeof parseFieldsRestRequest>[0];

type TestFlatFieldMetadata = NonNullable<
  ParseFieldsRestRequestArgs['flatFieldMetadataMaps']['byUniversalIdentifier'][string]
>;

const FIELD_NAMES = ['id', 'name', 'emails', 'company', 'salary'];

const FIELDS: TestFlatFieldMetadata[] = FIELD_NAMES.map((name) => ({
  id: `${name}-id`,
  universalIdentifier: `${name}-universal-identifier`,
  applicationId: 'application-id',
  workspaceId: 'workspace-id',
  name,
}));

const buildArgs = (
  query: ParseFieldsRestRequestArgs['request']['query'],
): ParseFieldsRestRequestArgs => ({
  request: { query },
  flatObjectMetadata: {
    fieldIds: FIELDS.map((field) => field.id),
    nameSingular: 'person',
  },
  flatFieldMetadataMaps: {
    byUniversalIdentifier: Object.fromEntries(
      FIELDS.map((field) => [field.universalIdentifier, field]),
    ),
    universalIdentifierById: Object.fromEntries(
      FIELDS.map((field) => [field.id, field.universalIdentifier]),
    ),
    universalIdentifiersByApplicationId: {},
  },
  restrictedFields: { 'salary-id': { canRead: false } },
});

describe('parseFieldsRestRequest', () => {
  it('should return undefined when fields parameter is not provided', () => {
    expect(parseFieldsRestRequest(buildArgs({}))).toBeUndefined();
  });

  it('should parse a comma-separated list of field names', () => {
    expect(
      parseFieldsRestRequest(buildArgs({ fields: 'id,name,emails,company' })),
    ).toEqual(['id', 'name', 'emails', 'company']);
  });

  it('should trim whitespace and ignore empty entries', () => {
    expect(
      parseFieldsRestRequest(buildArgs({ fields: ' name , emails ,, ' })),
    ).toEqual(['name', 'emails']);
  });

  it('should remove duplicates', () => {
    expect(
      parseFieldsRestRequest(buildArgs({ fields: 'name,emails,name' })),
    ).toEqual(['name', 'emails']);
  });

  it('should merge repeated fields parameters', () => {
    expect(
      parseFieldsRestRequest(buildArgs({ fields: ['name', 'emails,company'] })),
    ).toEqual(['name', 'emails', 'company']);
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

  it('should throw on unknown fields', () => {
    expect(() =>
      parseFieldsRestRequest(buildArgs({ fields: 'name,unknownField,other' })),
    ).toThrow(
      "'fields' parameter invalid. Unknown or unreadable fields on 'person': unknownField, other",
    );
  });

  it('should throw on fields the caller cannot read', () => {
    expect(() =>
      parseFieldsRestRequest(buildArgs({ fields: 'name,salary' })),
    ).toThrow(
      "'fields' parameter invalid. Unknown or unreadable fields on 'person': salary",
    );
  });
});
