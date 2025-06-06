import { FieldMetadataType } from '~/generated-metadata/graphql';
import { fetchObjectRecords } from '../fetchObjectRecords';

jest.mock('@apollo/client');
jest.mock(
  '@/settings/data-model/constants/SettingsCompositeFieldTypeConfigs',
  () => ({
    SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS: {
      [FieldMetadataType.FULL_NAME]: {
        subFields: ['firstName', 'lastName'],
      },
      [FieldMetadataType.ADDRESS]: {
        subFields: [
          'addressStreet1',
          'addressStreet2',
          'addressCity',
          'addressState',
          'addressCountry',
          'addressPostcode',
          'addressLat',
          'addressLng',
        ],
      },
      [FieldMetadataType.CURRENCY]: {
        subFields: ['amountMicros', 'currencyCode'],
      },
      [FieldMetadataType.PHONES]: {
        subFields: [
          'primaryPhoneNumber',
          'primaryPhoneCountryCode',
          'primaryPhoneCallingCode',
          'additionalPhones',
        ],
      },
      [FieldMetadataType.EMAILS]: {
        subFields: ['primaryEmail', 'additionalEmails'],
      },
      [FieldMetadataType.LINKS]: {
        subFields: ['primaryLinkUrl', 'primaryLinkLabel', 'secondaryLinks'],
      },
      [FieldMetadataType.ACTOR]: {
        subFields: ['source', 'name'],
      },
      [FieldMetadataType.RICH_TEXT_V2]: {
        subFields: ['blocknote', 'markdown'],
      },
    },
  }),
);

interface Field {
  name: string;
  type: string;
}

interface ObjectMetadataItem {
  fields: Field[];
}

interface ApolloClient {
  query: jest.MockedFunction<any>;
}

describe('fetchObjectRecords', () => {
  const mockApolloClient: ApolloClient = {
    query: jest.fn(),
  };

  const mockObjectMetadataItem: ObjectMetadataItem = {
    fields: [
      { name: 'email', type: 'EMAIL' },
      { name: 'fullName', type: FieldMetadataType.FULL_NAME },
      { name: 'age', type: 'NUMBER' },
      { name: 'tags', type: 'MULTI_SELECT' },
      { name: 'category', type: 'RELATION' },
      { name: 'status', type: 'SELECT' },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch records successfully', async () => {
    const mockData = {
      people: {
        edges: [
          {
            node: {
              id: '1',
              email: 'john@example.com',
              fullName: { firstName: 'John', lastName: 'Doe' },
              age: 30,
            },
          },
          {
            node: {
              id: '2',
              email: 'jane@example.com',
              fullName: { firstName: 'Jane', lastName: 'Smith' },
              age: 25,
            },
          },
        ],
      },
    };

    mockApolloClient.query.mockResolvedValue({ data: mockData });

    const result = await fetchObjectRecords(
      'people',
      mockObjectMetadataItem,
      mockApolloClient,
    );

    expect(result).toEqual([
      {
        id: '1',
        email: 'john@example.com',
        fullName: { firstName: 'John', lastName: 'Doe' },
        age: 30,
      },
      {
        id: '2',
        email: 'jane@example.com',
        fullName: { firstName: 'Jane', lastName: 'Smith' },
        age: 25,
      },
    ]);

    expect(mockApolloClient.query).toHaveBeenCalledWith({
      query: expect.any(Object),
      variables: { first: 1000 },
      errorPolicy: 'all',
      fetchPolicy: 'no-cache',
    });
  });

  it('should handle query errors gracefully', async () => {
    mockApolloClient.query.mockRejectedValue(new Error('Network error'));

    const result = await fetchObjectRecords(
      'people',
      mockObjectMetadataItem,
      mockApolloClient,
    );

    expect(result).toEqual([]);
  });

  it('should handle missing data gracefully', async () => {
    mockApolloClient.query.mockResolvedValue({ data: null });

    const result = await fetchObjectRecords(
      'people',
      mockObjectMetadataItem,
      mockApolloClient,
    );

    expect(result).toEqual([]);
  });

  it('should handle missing edges gracefully', async () => {
    mockApolloClient.query.mockResolvedValue({
      data: { people: { edges: null } },
    });

    const result = await fetchObjectRecords(
      'people',
      mockObjectMetadataItem,
      mockApolloClient,
    );

    expect(result).toEqual([]);
  });

  it('should handle object without fields', async () => {
    const emptyObjectMetadata = { fields: null };
    mockApolloClient.query.mockResolvedValue({
      data: { people: { edges: [] } },
    });

    const result = await fetchObjectRecords(
      'people',
      emptyObjectMetadata as any,
      mockApolloClient,
    );

    expect(result).toEqual([]);
    expect(mockApolloClient.query).toHaveBeenCalled();
  });

  it('should properly construct GraphQL query with composite fields', async () => {
    mockApolloClient.query.mockResolvedValue({
      data: { people: { edges: [] } },
    });

    await fetchObjectRecords(
      'people',
      mockObjectMetadataItem,
      mockApolloClient,
    );

    const queryCall = mockApolloClient.query.mock.calls[0][0];
    const queryString = queryCall.query.loc.source.body;

    expect(queryString).toContain('email');
    expect(queryString).toContain('age');
    expect(queryString).toContain('fullName');
    expect(queryString).toContain('firstName');
    expect(queryString).toContain('lastName');
    expect(queryString).not.toContain('tags');
    expect(queryString).not.toContain('category');
    expect(queryString).not.toContain('status');
  });

  it('should exclude RELATION, MULTI_SELECT, and SELECT fields', async () => {
    const objectWithExcludedFields: ObjectMetadataItem = {
      fields: [
        { name: 'name', type: 'TEXT' },
        { name: 'tags', type: 'MULTI_SELECT' },
        { name: 'owner', type: 'RELATION' },
        { name: 'status', type: 'SELECT' },
      ],
    };

    mockApolloClient.query.mockResolvedValue({
      data: { people: { edges: [] } },
    });

    await fetchObjectRecords(
      'people',
      objectWithExcludedFields,
      mockApolloClient,
    );

    const queryCall = mockApolloClient.query.mock.calls[0][0];
    const queryString = queryCall.query.loc.source.body;

    expect(queryString).toContain('name');
    expect(queryString).not.toContain('tags');
    expect(queryString).not.toContain('owner');
    expect(queryString).not.toContain('status');
  });

  it('should handle singular/plural name conversion', async () => {
    mockApolloClient.query.mockResolvedValue({
      data: { companies: { edges: [] } },
    });

    await fetchObjectRecords(
      'companies',
      mockObjectMetadataItem,
      mockApolloClient,
    );

    const queryCall = mockApolloClient.query.mock.calls[0][0];
    const queryString = queryCall.query.loc.source.body;

    expect(queryString).toContain('Findcompanies');
    expect(queryString).toContain('companies(first: $first)');
  });

  it('should handle different plural forms correctly', async () => {
    mockApolloClient.query.mockResolvedValue({
      data: { people: { edges: [] } },
    });

    await fetchObjectRecords(
      'people',
      mockObjectMetadataItem,
      mockApolloClient,
    );

    let queryCall = mockApolloClient.query.mock.calls[0][0];
    let queryString = queryCall.query.loc.source.body;

    expect(queryString).toContain('Findpeople');
    expect(queryString).toContain('people(first: $first)');

    jest.clearAllMocks();

    mockApolloClient.query.mockResolvedValue({
      data: { tasks: { edges: [] } },
    });

    await fetchObjectRecords('tasks', mockObjectMetadataItem, mockApolloClient);

    queryCall = mockApolloClient.query.mock.calls[0][0];
    queryString = queryCall.query.loc.source.body;

    expect(queryString).toContain('Findtasks');
    expect(queryString).toContain('tasks(first: $first)');
  });

  it('should handle composite fields in query structure', async () => {
    const objectWithCompositeFields: ObjectMetadataItem = {
      fields: [
        { name: 'name', type: 'TEXT' },
        { name: 'fullName', type: FieldMetadataType.FULL_NAME },
        { name: 'homeAddress', type: FieldMetadataType.ADDRESS },
        { name: 'contactPhones', type: FieldMetadataType.PHONES },
      ],
    };

    mockApolloClient.query.mockResolvedValue({
      data: { people: { edges: [] } },
    });

    await fetchObjectRecords(
      'people',
      objectWithCompositeFields,
      mockApolloClient,
    );

    const queryCall = mockApolloClient.query.mock.calls[0][0];
    const queryString = queryCall.query.loc.source.body;

    // Should include simple field
    expect(queryString).toContain('name');

    // Should include composite fields with nested structure
    expect(queryString).toContain('fullName');
    expect(queryString).toContain('homeAddress');
    expect(queryString).toContain('contactPhones');
  });

  it('should handle empty fields array', async () => {
    const emptyFieldsObject: ObjectMetadataItem = { fields: [] };

    mockApolloClient.query.mockResolvedValue({
      data: { people: { edges: [] } },
    });

    const result = await fetchObjectRecords(
      'people',
      emptyFieldsObject,
      mockApolloClient,
    );

    expect(result).toEqual([]);
    expect(mockApolloClient.query).toHaveBeenCalled();
  });

  it('should include standard fields (id, createdAt, updatedAt)', async () => {
    const minimalObject: ObjectMetadataItem = {
      fields: [{ name: 'name', type: 'TEXT' }],
    };

    mockApolloClient.query.mockResolvedValue({
      data: { people: { edges: [] } },
    });

    await fetchObjectRecords('people', minimalObject, mockApolloClient);

    const queryCall = mockApolloClient.query.mock.calls[0][0];
    const queryString = queryCall.query.loc.source.body;

    expect(queryString).toContain('id');
    expect(queryString).toContain('createdAt');
    expect(queryString).toContain('updatedAt');
    expect(queryString).toContain('name');
  });

  it('should handle missing edges data structure', async () => {
    mockApolloClient.query.mockResolvedValue({
      data: { people: {} },
    });

    const result = await fetchObjectRecords(
      'people',
      mockObjectMetadataItem,
      mockApolloClient,
    );

    expect(result).toEqual([]);
  });

  it('should handle response with empty edges array', async () => {
    mockApolloClient.query.mockResolvedValue({
      data: { people: { edges: [] } },
    });

    const result = await fetchObjectRecords(
      'people',
      mockObjectMetadataItem,
      mockApolloClient,
    );

    expect(result).toEqual([]);
  });

  it('should use correct variables in GraphQL query', async () => {
    mockApolloClient.query.mockResolvedValue({
      data: { people: { edges: [] } },
    });

    await fetchObjectRecords(
      'people',
      mockObjectMetadataItem,
      mockApolloClient,
    );

    expect(mockApolloClient.query).toHaveBeenCalledWith({
      query: expect.any(Object),
      variables: { first: 1000 },
      errorPolicy: 'all',
      fetchPolicy: 'no-cache',
    });
  });
});
