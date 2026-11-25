import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { buildDeviceConditionalEvaluationNode } from 'twenty-shared/conditional-evaluation';
import { isDefined } from 'twenty-shared/utils';

import { computePageLayoutWidgetWithCopiedConditionalAvailability } from 'src/database/commands/upgrade-version-command/2-63/utils/compute-page-layout-widget-with-copied-conditional-availability.util';
import { resolveEffectiveFlatEntity } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-flat-entity.util';

const WORKSPACE_CUSTOM_APPLICATION = '9d2f7b53-5a6f-4c58-9b9b-2f3d6b6f7a01';
const NOW = '2026-11-23T10:00:00.000Z';
const STORED_UPDATED_AT = '2026-01-01T00:00:00.000Z';

const MOBILE_TEXT_RULE = 'device == "MOBILE"';
const DESKTOP_TEXT_RULE = 'device == "DESKTOP"';
const UNREADABLE_TEXT_RULE = 'numberOfSelectedRecords - 1 == 0';
const MOBILE_JSON_LOGIC_RULE = {
  and: [{ '===': [{ var: 'device' }, 'MOBILE'] }],
};
const UNREADABLE_JSON_LOGIC_RULE = {
  '<': [{ var: 'selectedRecords.0.amount' }, 5],
};

type TestPageLayoutWidget = Parameters<
  typeof computePageLayoutWidgetWithCopiedConditionalAvailability
>[0]['flatPageLayoutWidget'];

const buildPageLayoutWidget = (
  properties: Partial<TestPageLayoutWidget>,
): TestPageLayoutWidget => ({
  conditionalAvailability: null,
  conditionalAvailabilityExpression: null,
  conditionalDisplay: null,
  overrides: null,
  universalOverrides: null,
  applicationUniversalIdentifier:
    TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
  updatedAt: STORED_UPDATED_AT,
  ...properties,
});

const compute = (flatPageLayoutWidget: TestPageLayoutWidget) =>
  computePageLayoutWidgetWithCopiedConditionalAvailability({
    flatPageLayoutWidget,
    workspaceCustomApplicationUniversalIdentifier: WORKSPACE_CUSTOM_APPLICATION,
    pageLayoutTabUniversalIdentifierById: {},
    now: NOW,
  });

const computeUpdatedPageLayoutWidgetOrThrow = (
  flatPageLayoutWidget: TestPageLayoutWidget,
) => {
  const { pageLayoutWidgetToUpdate } = compute(flatPageLayoutWidget);

  if (!isDefined(pageLayoutWidgetToUpdate)) {
    throw new Error('Expected the widget to be updated');
  }

  return pageLayoutWidgetToUpdate;
};

const getEffectiveRule = (flatPageLayoutWidget: TestPageLayoutWidget) => {
  const {
    conditionalAvailability,
    conditionalAvailabilityExpression,
    conditionalDisplay,
  } = resolveEffectiveFlatEntity({
    metadataName: 'pageLayoutWidget',
    flatEntity: flatPageLayoutWidget,
    authorContext: {
      workspaceCustomApplicationUniversalIdentifier:
        WORKSPACE_CUSTOM_APPLICATION,
    },
  });

  return {
    conditionalAvailability,
    conditionalAvailabilityExpression,
    conditionalDisplay,
  };
};

describe('computePageLayoutWidgetWithCopiedConditionalAvailability', () => {
  it('should copy a text rule into the tree and keep the text', () => {
    const pageLayoutWidget = computeUpdatedPageLayoutWidgetOrThrow(
      buildPageLayoutWidget({
        conditionalAvailabilityExpression: MOBILE_TEXT_RULE,
      }),
    );

    expect(pageLayoutWidget).toMatchObject({
      conditionalAvailability: buildDeviceConditionalEvaluationNode('MOBILE'),
      conditionalAvailabilityExpression: MOBILE_TEXT_RULE,
      conditionalDisplay: null,
      overrides: null,
      updatedAt: NOW,
    });
  });

  it('should copy a device json-logic rule into the tree and keep the json-logic', () => {
    const pageLayoutWidget = computeUpdatedPageLayoutWidgetOrThrow(
      buildPageLayoutWidget({ conditionalDisplay: MOBILE_JSON_LOGIC_RULE }),
    );

    expect(pageLayoutWidget).toMatchObject({
      conditionalAvailability: buildDeviceConditionalEvaluationNode('MOBILE'),
      conditionalAvailabilityExpression: null,
      conditionalDisplay: MOBILE_JSON_LOGIC_RULE,
    });
  });

  it('should copy the text rule when a widget holds both a text and a json-logic rule', () => {
    const pageLayoutWidget = computeUpdatedPageLayoutWidgetOrThrow(
      buildPageLayoutWidget({
        conditionalAvailabilityExpression: DESKTOP_TEXT_RULE,
        conditionalDisplay: MOBILE_JSON_LOGIC_RULE,
      }),
    );

    expect(pageLayoutWidget.conditionalAvailability).toEqual(
      buildDeviceConditionalEvaluationNode('DESKTOP'),
    );
  });

  it('should not update a widget that holds no legacy rule', () => {
    expect(compute(buildPageLayoutWidget({}))).toEqual({
      pageLayoutWidgetToUpdate: undefined,
      unreadableRuleMessages: [],
    });
  });

  it('should not replace a tree that is already stored', () => {
    expect(
      compute(
        buildPageLayoutWidget({
          conditionalAvailability:
            buildDeviceConditionalEvaluationNode('DESKTOP'),
          conditionalAvailabilityExpression: MOBILE_TEXT_RULE,
        }),
      ).pageLayoutWidgetToUpdate,
    ).toBeUndefined();
  });

  it.each([
    { conditionalAvailabilityExpression: UNREADABLE_TEXT_RULE },
    { conditionalDisplay: UNREADABLE_JSON_LOGIC_RULE },
  ])(
    'should leave a rule it cannot read as it is and report it: %j',
    (unreadableRule) => {
      const { pageLayoutWidgetToUpdate, unreadableRuleMessages } = compute(
        buildPageLayoutWidget(unreadableRule),
      );

      expect(pageLayoutWidgetToUpdate).toBeUndefined();
      expect(unreadableRuleMessages).toHaveLength(1);
    },
  );

  it('should copy an overridden text rule into the override and keep the overridden text', () => {
    const pageLayoutWidget = computeUpdatedPageLayoutWidgetOrThrow(
      buildPageLayoutWidget({
        conditionalAvailabilityExpression: MOBILE_TEXT_RULE,
        overrides: {
          [WORKSPACE_CUSTOM_APPLICATION]: {
            conditionalAvailabilityExpression: DESKTOP_TEXT_RULE,
          },
        },
      }),
    );

    expect(pageLayoutWidget).toMatchObject({
      conditionalAvailability: buildDeviceConditionalEvaluationNode('MOBILE'),
      conditionalAvailabilityExpression: MOBILE_TEXT_RULE,
    });
    expect(getEffectiveRule(pageLayoutWidget)).toEqual({
      conditionalAvailability: buildDeviceConditionalEvaluationNode('DESKTOP'),
      conditionalAvailabilityExpression: DESKTOP_TEXT_RULE,
      conditionalDisplay: null,
    });
  });

  it('should keep a widget visible to everyone when an override cleared its rule', () => {
    const pageLayoutWidget = computeUpdatedPageLayoutWidgetOrThrow(
      buildPageLayoutWidget({
        conditionalAvailabilityExpression: MOBILE_TEXT_RULE,
        overrides: {
          [WORKSPACE_CUSTOM_APPLICATION]: {
            conditionalAvailabilityExpression: null,
          },
        },
      }),
    );

    expect(pageLayoutWidget.conditionalAvailability).toEqual(
      buildDeviceConditionalEvaluationNode('MOBILE'),
    );
    expect(getEffectiveRule(pageLayoutWidget)).toEqual({
      conditionalAvailability: null,
      conditionalAvailabilityExpression: null,
      conditionalDisplay: null,
    });
  });

  it('should not touch an override that already stores a tree', () => {
    const storedOverrides = {
      [WORKSPACE_CUSTOM_APPLICATION]: {
        conditionalAvailability:
          buildDeviceConditionalEvaluationNode('DESKTOP'),
        conditionalAvailabilityExpression: null,
        conditionalDisplay: null,
      },
    };

    const pageLayoutWidget = computeUpdatedPageLayoutWidgetOrThrow(
      buildPageLayoutWidget({
        conditionalAvailabilityExpression: MOBILE_TEXT_RULE,
        overrides: storedOverrides,
      }),
    );

    expect(pageLayoutWidget.overrides).toEqual(storedOverrides);
  });

  it.each([
    buildPageLayoutWidget({
      conditionalAvailabilityExpression: MOBILE_TEXT_RULE,
    }),
    buildPageLayoutWidget({
      conditionalAvailabilityExpression: MOBILE_TEXT_RULE,
      overrides: {
        [WORKSPACE_CUSTOM_APPLICATION]: {
          conditionalAvailabilityExpression: DESKTOP_TEXT_RULE,
        },
      },
    }),
    buildPageLayoutWidget({
      conditionalAvailabilityExpression: MOBILE_TEXT_RULE,
      overrides: {
        [WORKSPACE_CUSTOM_APPLICATION]: {
          conditionalAvailabilityExpression: null,
        },
      },
    }),
  ])('should change nothing when it runs a second time: %#', (storedWidget) => {
    const pageLayoutWidgetAfterFirstRun =
      computeUpdatedPageLayoutWidgetOrThrow(storedWidget);

    expect(
      compute(pageLayoutWidgetAfterFirstRun).pageLayoutWidgetToUpdate,
    ).toBeUndefined();
  });
});
