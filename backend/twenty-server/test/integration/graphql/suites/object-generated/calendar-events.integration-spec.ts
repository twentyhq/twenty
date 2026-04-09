import { CALENDAR_EVENT_GQL_FIELDS } from 'test/integration/constants/calendar-event-gql-fields.constants';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { findOneOperationFactory } from 'test/integration/graphql/utils/find-one-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';

import { CALENDAR_EVENT_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/calendar-event-data-seeds.constant';

describe('calendarEventsResolver (e2e)', () => {
  it('should find many calendarEvents', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'calendarEvent',
      objectMetadataPluralName: 'calendarEvents',
      gqlFields: CALENDAR_EVENT_GQL_FIELDS,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const data = response.body.data.calendarEvents;

    expect(data).toBeDefined();
    expect(Array.isArray(data.edges)).toBe(true);

    const edges = data.edges;

    expect(edges.length).toEqual(QUERY_MAX_RECORDS);

    const calendarEvent = edges[0].node;

    expect(calendarEvent).toMatchSnapshot({
      createdAt: expect.any(String),
      endsAt: expect.any(String),
      startsAt: expect.any(String),
      updatedAt: expect.any(String),
      title: expect.any(String),
      description: expect.any(String),
    });
  });

  it('should find one calendarEvent', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'calendarEvent',
      filter: { id: { eq: CALENDAR_EVENT_DATA_SEED_IDS.ID_1 } },
      gqlFields: CALENDAR_EVENT_GQL_FIELDS,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const data = response.body.data.calendarEvent;

    expect(data).toBeDefined();
    expect(data).toMatchSnapshot({
      createdAt: expect.any(String),
      endsAt: expect.any(String),
      startsAt: expect.any(String),
      updatedAt: expect.any(String),
      title: expect.any(String),
      description: expect.any(String),
    });
  });
});
