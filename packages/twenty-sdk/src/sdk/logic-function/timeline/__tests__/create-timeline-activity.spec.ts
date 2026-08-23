import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from 'vitest';

const TYPE_UNIVERSAL_IDENTIFIER = '11111111-1111-4111-8111-111111111111';
const TYPE_ID = '22222222-2222-4222-8222-222222222222';
const TARGET_OBJECT_UNIVERSAL_IDENTIFIER =
  '66666666-6666-4666-8666-666666666666';
const LINKED_OBJECT_UNIVERSAL_IDENTIFIER =
  '77777777-7777-4777-8777-777777777777';
const LINKED_OBJECT_ID = '88888888-8888-4888-8888-888888888888';

const importCreateTimelineActivity = async () => {
  const module =
    await import('@/sdk/logic-function/timeline/create-timeline-activity');

  return module.createTimelineActivity;
};

const response = (data: unknown) =>
  new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

describe('createTimelineActivity', () => {
  let fetchSpy: MockInstance<typeof fetch>;

  beforeEach(() => {
    vi.resetModules();
    process.env.TWENTY_API_URL = 'https://api.test';
    process.env.TWENTY_APP_ACCESS_TOKEN = 'app-token';
    fetchSpy = vi.spyOn(globalThis, 'fetch');
  });

  afterEach(() => {
    delete process.env.TWENTY_API_URL;
    delete process.env.TWENTY_APP_ACCESS_TOKEN;
    fetchSpy.mockRestore();
  });

  it('resolves the manifest identifier and creates a generically targeted row', async () => {
    const createTimelineActivity = await importCreateTimelineActivity();
    const createdTimelineActivity = {
      id: '33333333-3333-4333-8333-333333333333',
      timelineActivityTypeId: TYPE_ID,
      timelineActivityTypeSnapshot: { label: 'updated a post card' },
    };

    fetchSpy
      .mockResolvedValueOnce(
        response({
          data: {
            timelineActivityTypes: [
              {
                id: TYPE_ID,
                universalIdentifier: TYPE_UNIVERSAL_IDENTIFIER,
                isActive: true,
              },
            ],
            objects: {
              edges: [
                {
                  node: {
                    universalIdentifier: TARGET_OBJECT_UNIVERSAL_IDENTIFIER,
                    nameSingular: 'postCard',
                  },
                },
                {
                  node: {
                    id: LINKED_OBJECT_ID,
                    universalIdentifier: LINKED_OBJECT_UNIVERSAL_IDENTIFIER,
                    nameSingular: 'recipient',
                  },
                },
              ],
            },
          },
        }),
      )
      .mockResolvedValueOnce(
        response({
          data: { createTimelineActivity: createdTimelineActivity },
        }),
      );

    await expect(
      createTimelineActivity({
        timelineActivityTypeUniversalIdentifier: TYPE_UNIVERSAL_IDENTIFIER,
        targetObjectUniversalIdentifier: TARGET_OBJECT_UNIVERSAL_IDENTIFIER,
        targetRecordId: '44444444-4444-4444-8444-444444444444',
        linkedRecordId: '55555555-5555-4555-8555-555555555555',
        linkedObjectMetadataUniversalIdentifier:
          LINKED_OBJECT_UNIVERSAL_IDENTIFIER,
        properties: { delivery: 'express' },
      }),
    ).resolves.toEqual(createdTimelineActivity);

    expect(fetchSpy.mock.calls[0][0]).toBe('https://api.test/metadata');
    expect(fetchSpy.mock.calls[0][1]?.body).toContain(
      TARGET_OBJECT_UNIVERSAL_IDENTIFIER,
    );
    expect(fetchSpy.mock.calls[0][1]?.body).toContain(
      LINKED_OBJECT_UNIVERSAL_IDENTIFIER,
    );
    expect(fetchSpy.mock.calls[1][0]).toBe(
      'https://api.test/rest/timelineActivities',
    );

    const restBody = JSON.parse(fetchSpy.mock.calls[1][1]?.body as string);

    expect(restBody).toEqual({
      timelineActivityTypeId: TYPE_ID,
      targetPostCardId: '44444444-4444-4444-8444-444444444444',
      linkedRecordId: '55555555-5555-4555-8555-555555555555',
      linkedObjectMetadataId: LINKED_OBJECT_ID,
      properties: { delivery: 'express' },
    });
  });

  it('fails before writing when the application type is not installed', async () => {
    const createTimelineActivity = await importCreateTimelineActivity();
    fetchSpy.mockResolvedValueOnce(
      response({
        data: { timelineActivityTypes: [], objects: { edges: [] } },
      }),
    );

    await expect(
      createTimelineActivity({
        timelineActivityTypeUniversalIdentifier: TYPE_UNIVERSAL_IDENTIFIER,
        targetObjectUniversalIdentifier: TARGET_OBJECT_UNIVERSAL_IDENTIFIER,
        targetRecordId: '44444444-4444-4444-8444-444444444444',
      }),
    ).rejects.toThrow(
      `Timeline activity type ${TYPE_UNIVERSAL_IDENTIFIER} is not installed`,
    );

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('fails before writing when the application type is inactive', async () => {
    const createTimelineActivity = await importCreateTimelineActivity();

    fetchSpy.mockResolvedValueOnce(
      response({
        data: {
          timelineActivityTypes: [
            {
              id: TYPE_ID,
              universalIdentifier: TYPE_UNIVERSAL_IDENTIFIER,
              isActive: false,
            },
          ],
          objects: { edges: [] },
        },
      }),
    );

    await expect(
      createTimelineActivity({
        timelineActivityTypeUniversalIdentifier: TYPE_UNIVERSAL_IDENTIFIER,
        targetObjectUniversalIdentifier: TARGET_OBJECT_UNIVERSAL_IDENTIFIER,
        targetRecordId: '44444444-4444-4444-8444-444444444444',
      }),
    ).rejects.toThrow(
      `Timeline activity type ${TYPE_UNIVERSAL_IDENTIFIER} is inactive`,
    );

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('fails before writing when the target object is not installed', async () => {
    const createTimelineActivity = await importCreateTimelineActivity();

    fetchSpy.mockResolvedValueOnce(
      response({
        data: {
          timelineActivityTypes: [
            {
              id: TYPE_ID,
              universalIdentifier: TYPE_UNIVERSAL_IDENTIFIER,
              isActive: true,
            },
          ],
          objects: { edges: [] },
        },
      }),
    );

    await expect(
      createTimelineActivity({
        timelineActivityTypeUniversalIdentifier: TYPE_UNIVERSAL_IDENTIFIER,
        targetObjectUniversalIdentifier: TARGET_OBJECT_UNIVERSAL_IDENTIFIER,
        targetRecordId: '44444444-4444-4444-8444-444444444444',
      }),
    ).rejects.toThrow(
      `Timeline activity target object ${TARGET_OBJECT_UNIVERSAL_IDENTIFIER} is not installed`,
    );

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});
