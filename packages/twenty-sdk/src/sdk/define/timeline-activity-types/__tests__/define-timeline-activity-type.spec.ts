import { describe, expect, it } from 'vitest';

import { defineTimelineActivityType } from '@/sdk/define';

const baseValidConfig = {
  universalIdentifier: '11111111-1111-4111-8111-111111111111',
  name: 'deploymentCompleted',
  label: 'completed a deployment',
  action: 'updated' as const,
  objectUniversalIdentifier: '22222222-2222-4222-8222-222222222222',
  targetRelationFieldUniversalIdentifier:
    '44444444-4444-4444-8444-444444444444',
  triggerFieldUniversalIdentifiers: ['55555555-5555-4555-8555-555555555555'],
  frontComponentUniversalIdentifier: '33333333-3333-4333-8333-333333333333',
};

describe('defineTimelineActivityType', () => {
  it('returns the generic native and custom rendering contract', () => {
    const result = defineTimelineActivityType(baseValidConfig);

    expect(result).toEqual({
      success: true,
      config: baseValidConfig,
      errors: [],
      warnings: [],
    });
  });

  it.each([
    [
      'universalIdentifier',
      'TimelineActivityType must have a universalIdentifier',
    ],
    ['name', 'TimelineActivityType must have a name'],
    ['label', 'TimelineActivityType must have a label'],
  ] as const)('reports a missing %s', (property, error) => {
    const result = defineTimelineActivityType({
      ...baseValidConfig,
      [property]: '',
    });

    expect(result.success).toBe(false);
    expect(result.errors).toContain(error);
  });

  it('reports an unsupported action', () => {
    const result = defineTimelineActivityType({
      ...baseValidConfig,
      // @ts-expect-error verifies runtime validation for JavaScript callers.
      action: 'deployed',
    });

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'TimelineActivityType action deployed is not supported',
    );
  });

  it('requires an action and source object for target relation routing', () => {
    const result = defineTimelineActivityType({
      ...baseValidConfig,
      action: undefined,
    });

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'TimelineActivityType targetRelationFieldUniversalIdentifier requires action and objectUniversalIdentifier',
    );
  });

  it('restricts trigger fields to updated target relation events', () => {
    const result = defineTimelineActivityType({
      ...baseValidConfig,
      action: 'linked',
    });

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'TimelineActivityType triggerFieldUniversalIdentifiers requires an updated target relation event',
    );
  });

  it('rejects duplicate trigger fields', () => {
    const triggerFieldUniversalIdentifier =
      baseValidConfig.triggerFieldUniversalIdentifiers[0];
    const result = defineTimelineActivityType({
      ...baseValidConfig,
      triggerFieldUniversalIdentifiers: [
        triggerFieldUniversalIdentifier,
        triggerFieldUniversalIdentifier,
      ],
    });

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'TimelineActivityType triggerFieldUniversalIdentifiers must be unique',
    );
  });

  it('requires a concrete event contract for overrides', () => {
    const result = defineTimelineActivityType({
      ...baseValidConfig,
      action: undefined,
      overridesTimelineActivityTypeUniversalIdentifier:
        '66666666-6666-4666-8666-666666666666',
    });

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'TimelineActivityType overridesTimelineActivityTypeUniversalIdentifier requires action and objectUniversalIdentifier',
    );
  });
});
