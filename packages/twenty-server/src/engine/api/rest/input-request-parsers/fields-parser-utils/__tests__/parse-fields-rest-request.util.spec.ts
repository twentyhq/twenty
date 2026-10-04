import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { parseFieldsRestRequest } from 'src/engine/api/rest/input-request-parsers/fields-parser-utils/parse-fields-rest-request.util';
import { RestInputRequestParserException } from 'src/engine/api/rest/input-request-parsers/rest-input-request-parser.exception';

type ParseFieldsRestRequestArgs = Parameters<typeof parseFieldsRestRequest>[0];

type TestFlatFieldMetadata =
  ParseFieldsRestRequestArgs['readableFlatFields'][number];

const createField = ({
  name,
  type = FieldMetadataType.TEXT,
  relationType,
}: {
  name: string;
  type?: FieldMetadataType;
  relationType?: RelationType;
}): TestFlatFieldMetadata => ({
  name,
  type,
  settings: relationType ? { relationType } : null,
});

const READABLE_FIELDS: TestFlatFieldMetadata[] = [
  createField({ name: 'id', type: FieldMetadataType.UUID }),
  createField({ name: 'name', type: FieldMetadataType.FULL_NAME }),
  createField({ name: 'emails', type: FieldMetadataType.EMAILS }),
  createField({
    name: 'company',
    type: FieldMetadataType.RELATION,
    relationType: RelationType.MANY_TO_ONE,
  }),
  createField({
    name: 'activities',
    type: FieldMetadataType.RELATION,
    relationType: RelationType.ONE_TO_MANY,
  }),
  createField({
    name: 'attachments',
    type: FieldMetadataType.MORPH_RELATION,
    relationType: RelationType.ONE_TO_MANY,
  }),
];

const buildArgs = (
  query: ParseFieldsRestRequestArgs['request']['query'],
  depth: ParseFieldsRestRequestArgs['depth'] = 0,
): ParseFieldsRestRequestArgs => ({
  request: { query },
  objectNameSingular: 'person',
  readableFlatFields: READABLE_FIELDS,
  depth,
});

describe('parseFieldsRestRequest', () => {
  it('should return undefined when fields parameter is not provided', () => {
    expect(parseFieldsRestRequest(buildArgs({}))).toBeUndefined();
  });

  it('should parse a comma-separated list of field names', () => {
    expect(
      parseFieldsRestRequest(buildArgs({ fields: 'id,name,emails,company' })),
    ).toEqual(new Set(['id', 'name', 'emails', 'company']));
  });

  it('should trim whitespace and ignore empty entries', () => {
    expect(
      parseFieldsRestRequest(buildArgs({ fields: ' name , emails ,, ' })),
    ).toEqual(new Set(['id', 'name', 'emails']));
  });

  it('should remove duplicates', () => {
    expect(
      parseFieldsRestRequest(buildArgs({ fields: 'name,emails,name' })),
    ).toEqual(new Set(['id', 'name', 'emails']));
  });

  it('should merge repeated fields parameters', () => {
    expect(
      parseFieldsRestRequest(buildArgs({ fields: ['name', 'emails,company'] })),
    ).toEqual(new Set(['id', 'name', 'emails', 'company']));
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

  it('should throw on unknown or unreadable fields', () => {
    expect(() =>
      parseFieldsRestRequest(buildArgs({ fields: 'name,unknownField,salary' })),
    ).toThrow(
      "'fields' parameter invalid. Unknown or unreadable fields on 'person': unknownField, salary",
    );
  });

  it('should throw on one-to-many relation fields at depth 0', () => {
    expect(() =>
      parseFieldsRestRequest(
        buildArgs({ fields: 'name,activities,attachments' }, 0),
      ),
    ).toThrow(
      "'fields' parameter invalid. One-to-many relation fields on 'person' are only returned with depth=1: activities, attachments",
    );
  });

  it('should accept one-to-many relation fields at depth 1', () => {
    expect(
      parseFieldsRestRequest(buildArgs({ fields: 'name,activities' }, 1)),
    ).toEqual(new Set(['id', 'name', 'activities']));
  });
});
