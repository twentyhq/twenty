import { describe, expect, it } from 'vitest';

import { parseSlackEntityDetailsEvent } from 'src/logic-functions/utils/parse-slack-entity-details-event';

const buildEntityDetailsBody = ({
  eventOverrides = {},
}: { eventOverrides?: Record<string, unknown> } = {}) => ({
  type: 'event_callback',
  event: {
    type: 'entity_details_requested',
    trigger_id: 'Tr123',
    user: 'U123',
    link: {
      url: 'https://acme.twenty.com/object/person/abc',
      domain: 'acme.twenty.com',
    },
    entity_url: 'https://acme.twenty.com/object/person/abc',
    external_ref: { id: 'abc', type: 'person' },
    ...eventOverrides,
  },
});

describe('parseSlackEntityDetailsEvent', () => {
  it('should parse an entity_details_requested event', () => {
    expect(parseSlackEntityDetailsEvent(buildEntityDetailsBody())).toEqual({
      detailsRequest: {
        triggerId: 'Tr123',
        slackUserId: 'U123',
        entityUrl: 'https://acme.twenty.com/object/person/abc',
        externalRef: { id: 'abc', type: 'person' },
      },
    });
  });

  it('should fall back to entity_url when the link is missing', () => {
    const result = parseSlackEntityDetailsEvent(
      buildEntityDetailsBody({ eventOverrides: { link: undefined } }),
    );

    expect(result.detailsRequest?.entityUrl).toBe(
      'https://acme.twenty.com/object/person/abc',
    );
  });

  it('should keep the external_ref without a type', () => {
    const result = parseSlackEntityDetailsEvent(
      buildEntityDetailsBody({
        eventOverrides: { external_ref: { id: 'abc' } },
      }),
    );

    expect(result.detailsRequest?.externalRef).toEqual({
      id: 'abc',
      type: undefined,
    });
  });

  it('should skip an event with no trigger_id', () => {
    const result = parseSlackEntityDetailsEvent(
      buildEntityDetailsBody({ eventOverrides: { trigger_id: undefined } }),
    );

    expect(result.detailsRequest).toBeNull();
  });

  it('should skip an event with no user, since the viewer gate needs one', () => {
    const result = parseSlackEntityDetailsEvent(
      buildEntityDetailsBody({ eventOverrides: { user: undefined } }),
    );

    expect(result.detailsRequest).toBeNull();
  });

  it('should skip other event types', () => {
    const result = parseSlackEntityDetailsEvent(
      buildEntityDetailsBody({ eventOverrides: { type: 'link_shared' } }),
    );

    expect(result.detailsRequest).toBeNull();
  });
});
