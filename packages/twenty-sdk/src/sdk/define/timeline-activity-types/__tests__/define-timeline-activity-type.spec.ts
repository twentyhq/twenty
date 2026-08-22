import { describe, expect, it } from 'vitest';

import { defineTimelineActivityType } from '@/sdk/define';

const baseValidConfig = {
  universalIdentifier: '11111111-1111-4111-8111-111111111111',
  name: 'deploymentCompleted',
  label: 'completed a deployment',
  emit: {
    on: 'updated' as const,
    objectUniversalIdentifier: '22222222-2222-4222-8222-222222222222',
    through: {
      relationFieldUniversalIdentifier: '44444444-4444-4444-8444-444444444444',
      triggerFieldUniversalIdentifiers: [
        '55555555-5555-4555-8555-555555555555',
      ],
    },
  },
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

  it('reports an unsupported emit action', () => {
    const result = defineTimelineActivityType({
      ...baseValidConfig,
      emit: {
        ...baseValidConfig.emit,
        // @ts-expect-error verifies runtime validation for JavaScript callers.
        on: 'deployed',
      },
    });

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'TimelineActivityType emit.on deployed is not supported',
    );
  });

  it('requires an action for automatic emission', () => {
    const result = defineTimelineActivityType({
      ...baseValidConfig,
      emit: {
        ...baseValidConfig.emit,
        // @ts-expect-error verifies runtime validation for JavaScript callers.
        on: '',
      },
    });

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'TimelineActivityType emit must have an on action',
    );
  });

  it('requires a source object for automatic emission', () => {
    const result = defineTimelineActivityType({
      ...baseValidConfig,
      emit: {
        ...baseValidConfig.emit,
        objectUniversalIdentifier: '',
      },
    });

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'TimelineActivityType emit must have an objectUniversalIdentifier',
    );
  });

  it('requires a relation field for through routing', () => {
    const result = defineTimelineActivityType({
      ...baseValidConfig,
      emit: {
        ...baseValidConfig.emit,
        through: {
          ...baseValidConfig.emit.through,
          relationFieldUniversalIdentifier: '',
        },
      },
    });

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'TimelineActivityType emit.through must have a relationFieldUniversalIdentifier',
    );
  });

  it('requires through routing for linked and unlinked events', () => {
    const result = defineTimelineActivityType({
      ...baseValidConfig,
      emit: {
        on: 'linked',
        objectUniversalIdentifier:
          baseValidConfig.emit.objectUniversalIdentifier,
      },
    });

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'TimelineActivityType linked and unlinked emitters require through routing',
    );
  });

  it('restricts trigger fields to updated through events', () => {
    const result = defineTimelineActivityType({
      ...baseValidConfig,
      emit: { ...baseValidConfig.emit, on: 'linked' },
    });

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'TimelineActivityType emit.through.triggerFieldUniversalIdentifiers requires an updated event',
    );
  });

  it('rejects duplicate trigger fields', () => {
    const triggerFieldUniversalIdentifier =
      baseValidConfig.emit.through.triggerFieldUniversalIdentifiers[0];
    const result = defineTimelineActivityType({
      ...baseValidConfig,
      emit: {
        ...baseValidConfig.emit,
        through: {
          ...baseValidConfig.emit.through,
          triggerFieldUniversalIdentifiers: [
            triggerFieldUniversalIdentifier,
            triggerFieldUniversalIdentifier,
          ],
        },
      },
    });

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'TimelineActivityType emit.through.triggerFieldUniversalIdentifiers must be unique',
    );
  });

  it('requires a concrete event contract for overrides', () => {
    const result = defineTimelineActivityType({
      ...baseValidConfig,
      emit: undefined,
      replacesTimelineActivityTypeUniversalIdentifier:
        '66666666-6666-4666-8666-666666666666',
    });

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'TimelineActivityType replacesTimelineActivityTypeUniversalIdentifier requires emit',
    );
  });

  it('accepts an explicit-only type without emit', () => {
    const result = defineTimelineActivityType({
      universalIdentifier: baseValidConfig.universalIdentifier,
      name: baseValidConfig.name,
      label: baseValidConfig.label,
    });

    expect(result).toMatchObject({ success: true, errors: [] });
  });

  it('accepts a self emitter without through routing', () => {
    const result = defineTimelineActivityType({
      ...baseValidConfig,
      emit: {
        on: 'created',
        objectUniversalIdentifier:
          baseValidConfig.emit.objectUniversalIdentifier,
      },
    });

    expect(result).toMatchObject({ success: true, errors: [] });
  });
});
