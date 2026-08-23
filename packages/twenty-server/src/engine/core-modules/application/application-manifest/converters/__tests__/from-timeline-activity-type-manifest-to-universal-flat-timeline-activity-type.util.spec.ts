import { fromTimelineActivityTypeManifestToUniversalFlatTimelineActivityType } from 'src/engine/core-modules/application/application-manifest/converters/from-timeline-activity-type-manifest-to-universal-flat-timeline-activity-type.util';

const APPLICATION_UNIVERSAL_IDENTIFIER = '11111111-1111-4111-8111-111111111111';
const TYPE_UNIVERSAL_IDENTIFIER = '22222222-2222-4222-8222-222222222222';
const OBJECT_UNIVERSAL_IDENTIFIER = '33333333-3333-4333-8333-333333333333';
const RELATION_UNIVERSAL_IDENTIFIER = '44444444-4444-4444-8444-444444444444';
const TRIGGER_UNIVERSAL_IDENTIFIER = '55555555-5555-4555-8555-555555555555';
const REPLACED_TYPE_UNIVERSAL_IDENTIFIER =
  '66666666-6666-4666-8666-666666666666';
const NOW = '2026-08-22T00:00:00.000Z';

describe('fromTimelineActivityTypeManifestToUniversalFlatTimelineActivityType', () => {
  it('normalizes nested emit routing into flat metadata', () => {
    expect(
      fromTimelineActivityTypeManifestToUniversalFlatTimelineActivityType({
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        now: NOW,
        timelineActivityTypeManifest: {
          universalIdentifier: TYPE_UNIVERSAL_IDENTIFIER,
          name: 'deploymentUpdated',
          label: 'updated a deployment',
          emit: {
            on: 'updated',
            objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
            through: {
              relationFieldUniversalIdentifier: RELATION_UNIVERSAL_IDENTIFIER,
              triggerFieldUniversalIdentifiers: [TRIGGER_UNIVERSAL_IDENTIFIER],
            },
          },
        },
      }),
    ).toMatchObject({
      action: 'updated',
      objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
      targetRelationFieldUniversalIdentifier: RELATION_UNIVERSAL_IDENTIFIER,
      triggerFieldUniversalIdentifiers: [TRIGGER_UNIVERSAL_IDENTIFIER],
    });
  });

  it('normalizes a type without emit as explicit-only', () => {
    expect(
      fromTimelineActivityTypeManifestToUniversalFlatTimelineActivityType({
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        now: NOW,
        timelineActivityTypeManifest: {
          universalIdentifier: TYPE_UNIVERSAL_IDENTIFIER,
          name: 'deploymentCompleted',
          label: 'completed a deployment',
        },
      }),
    ).toMatchObject({
      action: null,
      objectUniversalIdentifier: null,
      targetRelationFieldUniversalIdentifier: null,
      triggerFieldUniversalIdentifiers: null,
    });
  });

  it('normalizes an emitter without through routing to the source timeline', () => {
    expect(
      fromTimelineActivityTypeManifestToUniversalFlatTimelineActivityType({
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        now: NOW,
        timelineActivityTypeManifest: {
          universalIdentifier: TYPE_UNIVERSAL_IDENTIFIER,
          name: 'deploymentCreated',
          label: 'created a deployment',
          emit: {
            on: 'created',
            objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
          },
        },
      }),
    ).toMatchObject({
      action: 'created',
      objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
      targetRelationFieldUniversalIdentifier: null,
      triggerFieldUniversalIdentifiers: null,
    });
  });

  it('maps the public replacement identifier to internal metadata', () => {
    expect(
      fromTimelineActivityTypeManifestToUniversalFlatTimelineActivityType({
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        now: NOW,
        timelineActivityTypeManifest: {
          universalIdentifier: TYPE_UNIVERSAL_IDENTIFIER,
          name: 'customRecordCreated',
          label: 'created a custom record',
          emit: {
            on: 'created',
            objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
          },
          replacesTimelineActivityTypeUniversalIdentifier:
            REPLACED_TYPE_UNIVERSAL_IDENTIFIER,
        },
      }),
    ).toMatchObject({
      replacesTimelineActivityTypeUniversalIdentifier:
        REPLACED_TYPE_UNIVERSAL_IDENTIFIER,
    });
  });
});
