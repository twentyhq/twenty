import {
  buildDatabaseEventPayload,
  buildHttpPayload,
  buildToolPayloadFromSchema,
} from '@/settings/logic-functions/utils/getTriggerSamplePayload';
import { HTTPMethod } from 'twenty-shared/types';

describe('buildToolPayloadFromSchema', () => {
  it('returns an empty object when no schema is provided', () => {
    expect(buildToolPayloadFromSchema()).toEqual({});
    expect(buildToolPayloadFromSchema({})).toEqual({});
  });

  it('uses defaults when present', () => {
    expect(
      buildToolPayloadFromSchema({
        properties: {
          first: { type: 'string', default: 'hello' },
          second: { type: 'number', default: 42 },
        },
      }),
    ).toEqual({ first: 'hello', second: 42 });
  });

  it('falls back to type-specific sample values', () => {
    expect(
      buildToolPayloadFromSchema({
        properties: {
          a: { type: 'string' },
          b: { type: 'number' },
          c: { type: 'integer' },
          d: { type: 'boolean' },
          e: { type: 'array' },
          f: { type: 'object' },
          g: {},
        },
      }),
    ).toEqual({ a: '', b: 0, c: 0, d: false, e: [], f: {}, g: null });
  });
});

describe('buildHttpPayload', () => {
  it('omits the body for GET requests', () => {
    expect(
      buildHttpPayload({
        path: '/hello',
        httpMethod: HTTPMethod.GET,
        isAuthRequired: false,
      }),
    ).toMatchObject({
      body: null,
      requestContext: { http: { method: HTTPMethod.GET, path: '/s/hello' } },
    });
  });

  it('includes an empty body for non-GET requests', () => {
    expect(
      buildHttpPayload({
        path: '/hello',
        httpMethod: HTTPMethod.POST,
        isAuthRequired: false,
      }),
    ).toMatchObject({
      body: {},
      requestContext: { http: { method: HTTPMethod.POST, path: '/s/hello' } },
    });
  });
});

describe('buildDatabaseEventPayload', () => {
  it('returns null before for created events', () => {
    expect(
      buildDatabaseEventPayload({ eventName: 'person.created' }),
    ).toMatchObject({
      name: 'person.created',
      objectMetadata: { nameSingular: 'person' },
      properties: { after: {}, before: null, updatedFields: [] },
    });
  });

  it('returns an empty before for non-created events', () => {
    expect(
      buildDatabaseEventPayload({ eventName: 'person.updated' }),
    ).toMatchObject({
      properties: { after: {}, before: {}, updatedFields: [] },
    });
  });

  it('threads updatedFields through', () => {
    expect(
      buildDatabaseEventPayload({
        eventName: 'person.updated',
        updatedFields: ['name'],
      }),
    ).toMatchObject({ properties: { updatedFields: ['name'] } });
  });
});
