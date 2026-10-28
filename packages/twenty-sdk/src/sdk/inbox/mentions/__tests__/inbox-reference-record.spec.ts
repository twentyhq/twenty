import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from 'vitest';

const RECORD_ID = '20202020-0000-4000-8000-000000000003';
const LABEL_IDENTIFIER_FIELD_ID = '20202020-0000-4000-8000-000000000004';

type ObjectMetadataNode = {
  id: string;
  nameSingular: string;
  namePlural: string;
  labelIdentifierFieldMetadataId: string | null;
};

const importInboxReferenceRecord = async () => {
  const module = await import('@/sdk/inbox/mentions/inbox-reference-record');

  return module.inboxReferenceRecord;
};

const jsonResponse = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

const respondToMetadataAndRestRequests =
  ({
    objects,
    labelIdentifierField,
    record,
  }: {
    objects: ObjectMetadataNode[];
    labelIdentifierField?: { name: string; type: string };
    record: Record<string, unknown>;
  }) =>
  async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);

    if (url.startsWith('https://api.test/rest/')) {
      return jsonResponse({ data: record });
    }

    const { query } = JSON.parse(String(init?.body));

    if (query.includes('objects(')) {
      return jsonResponse({
        data: { objects: { edges: objects.map((node) => ({ node })) } },
      });
    }

    return jsonResponse({
      data: {
        object: { fields: { edges: [{ node: labelIdentifierField }] } },
      },
    });
  };

const COMPANY_OBJECT = {
  id: 'company-object-id',
  nameSingular: 'company',
  namePlural: 'companies',
  labelIdentifierFieldMetadataId: LABEL_IDENTIFIER_FIELD_ID,
};

describe('inboxReferenceRecord', () => {
  let fetchSpy: MockInstance<typeof fetch>;

  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('TWENTY_API_URL', 'https://api.test');
    vi.stubEnv('TWENTY_APP_ACCESS_TOKEN', 'access-token');
    fetchSpy = vi.spyOn(globalThis, 'fetch');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    fetchSpy.mockRestore();
  });

  it('labels the reference with the record label identifier', async () => {
    fetchSpy.mockImplementation(
      respondToMetadataAndRestRequests({
        objects: [COMPANY_OBJECT],
        labelIdentifierField: { name: 'name', type: 'TEXT' },
        record: { company: { id: RECORD_ID, name: 'Acme' } },
      }),
    );

    const inboxReferenceRecord = await importInboxReferenceRecord();

    await expect(
      inboxReferenceRecord({
        objectNameSingular: 'company',
        recordId: RECORD_ID,
      }),
    ).resolves.toBe(`[[record:company:${RECORD_ID}:Acme]]`);
    expect(fetchSpy.mock.calls.map(([input]) => String(input))).toContain(
      `https://api.test/rest/companies/${RECORD_ID}`,
    );
  });

  it('joins a full name label identifier', async () => {
    fetchSpy.mockImplementation(
      respondToMetadataAndRestRequests({
        objects: [
          {
            id: 'person-object-id',
            nameSingular: 'person',
            namePlural: 'people',
            labelIdentifierFieldMetadataId: LABEL_IDENTIFIER_FIELD_ID,
          },
        ],
        labelIdentifierField: { name: 'name', type: 'FULL_NAME' },
        record: {
          person: {
            id: RECORD_ID,
            name: { firstName: 'Ada', lastName: 'Lovelace' },
          },
        },
      }),
    );

    const inboxReferenceRecord = await importInboxReferenceRecord();

    await expect(
      inboxReferenceRecord({
        objectNameSingular: 'person',
        recordId: RECORD_ID,
      }),
    ).resolves.toBe(`[[record:person:${RECORD_ID}:Ada Lovelace]]`);
  });

  it('labels the reference with the record id when the object has no label identifier', async () => {
    fetchSpy.mockImplementation(
      respondToMetadataAndRestRequests({
        objects: [{ ...COMPANY_OBJECT, labelIdentifierFieldMetadataId: null }],
        record: { company: { id: RECORD_ID } },
      }),
    );

    const inboxReferenceRecord = await importInboxReferenceRecord();

    await expect(
      inboxReferenceRecord({
        objectNameSingular: 'company',
        recordId: RECORD_ID,
      }),
    ).resolves.toBe(`[[record:company:${RECORD_ID}:${RECORD_ID}]]`);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it('throws for an object the workspace does not have', async () => {
    fetchSpy.mockImplementation(
      respondToMetadataAndRestRequests({
        objects: [COMPANY_OBJECT],
        record: {},
      }),
    );

    const inboxReferenceRecord = await importInboxReferenceRecord();

    await expect(
      inboxReferenceRecord({
        objectNameSingular: 'invoice',
        recordId: RECORD_ID,
      }),
    ).rejects.toThrow(/no invoice object/);
  });
});
