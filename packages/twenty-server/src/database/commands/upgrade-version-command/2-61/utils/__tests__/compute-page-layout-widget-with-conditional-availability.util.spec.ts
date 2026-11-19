import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { type ConditionalAvailabilityNode } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { computePageLayoutWidgetWithConditionalAvailability } from 'src/database/commands/upgrade-version-command/2-61/utils/compute-page-layout-widget-with-conditional-availability.util';
import { resolveEffectiveFlatEntity } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-flat-entity.util';

const WORKSPACE_CUSTOM_APPLICATION = '9d2f7b53-5a6f-4c58-9b9b-2f3d6b6f7a01';
const NOW = '2026-11-18T10:00:00.000Z';

const MOBILE_JSON_LOGIC = { '===': [{ var: 'device' }, 'MOBILE'] };

const deviceIs = (device: string): ConditionalAvailabilityNode => ({
  type: 'COMPARISON',
  operator: 'EQUAL',
  left: { type: 'PATH', path: 'device' },
  right: { type: 'LITERAL', value: device },
});

const NO_LEGACY_RULE = {
  conditionalAvailabilityExpression: null,
  conditionalDisplay: null,
};

type TestPageLayoutWidget = Parameters<
  typeof computePageLayoutWidgetWithConditionalAvailability
>[0]['flatPageLayoutWidget'];

const buildPageLayoutWidget = (
  properties: Partial<TestPageLayoutWidget>,
): TestPageLayoutWidget => ({
  conditionalAvailability: null,
  ...NO_LEGACY_RULE,
  overrides: null,
  universalOverrides: null,
  applicationUniversalIdentifier:
    TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...properties,
});

type ComputeParameters = {
  flatPageLayoutWidget: TestPageLayoutWidget;
  standardConditionalAvailability?: ConditionalAvailabilityNode;
};

const compute = ({
  flatPageLayoutWidget,
  standardConditionalAvailability,
}: ComputeParameters) =>
  computePageLayoutWidgetWithConditionalAvailability({
    flatPageLayoutWidget,
    standardConditionalAvailability,
    workspaceCustomApplicationUniversalIdentifier: WORKSPACE_CUSTOM_APPLICATION,
    pageLayoutTabUniversalIdentifierById: {},
    now: NOW,
  });

const computeOrThrow = (computeParameters: ComputeParameters) => {
  const conversion = compute(computeParameters);

  if (!isDefined(conversion)) {
    throw new Error('Expected a conversion, got none');
  }

  return conversion;
};

const getDisplayedRule = (flatPageLayoutWidget: TestPageLayoutWidget) => {
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

describe('computePageLayoutWidgetWithConditionalAvailability', () => {
  it('should store a text rule as a tree and clear both old columns', () => {
    const { flatPageLayoutWidget } = computeOrThrow({
      flatPageLayoutWidget: buildPageLayoutWidget({
        applicationUniversalIdentifier: WORKSPACE_CUSTOM_APPLICATION,
        conditionalAvailabilityExpression: 'device == "MOBILE"',
      }),
    });

    expect(flatPageLayoutWidget).toMatchObject({
      conditionalAvailability: deviceIs('MOBILE'),
      ...NO_LEGACY_RULE,
      overrides: null,
      updatedAt: NOW,
    });
  });

  it('should store a json-logic rule as a tree', () => {
    const { flatPageLayoutWidget } = computeOrThrow({
      flatPageLayoutWidget: buildPageLayoutWidget({
        conditionalDisplay: MOBILE_JSON_LOGIC,
      }),
    });

    expect(flatPageLayoutWidget).toMatchObject({
      conditionalAvailability: deviceIs('MOBILE'),
      ...NO_LEGACY_RULE,
    });
  });

  it('should convert an override rule inside its own entry', () => {
    const { flatPageLayoutWidget } = computeOrThrow({
      flatPageLayoutWidget: buildPageLayoutWidget({
        conditionalAvailabilityExpression: 'device == "MOBILE"',
        overrides: {
          [WORKSPACE_CUSTOM_APPLICATION]: {
            conditionalAvailabilityExpression: 'device == "DESKTOP"',
          },
        },
      }),
    });

    expect(flatPageLayoutWidget).toMatchObject({
      conditionalAvailability: deviceIs('MOBILE'),
      ...NO_LEGACY_RULE,
    });
    expect(getDisplayedRule(flatPageLayoutWidget)).toEqual({
      conditionalAvailability: deviceIs('DESKTOP'),
      ...NO_LEGACY_RULE,
    });
  });

  it('should keep an override that shows the widget to everyone', () => {
    const { flatPageLayoutWidget } = computeOrThrow({
      flatPageLayoutWidget: buildPageLayoutWidget({
        conditionalAvailabilityExpression: 'device == "MOBILE"',
        overrides: {
          [WORKSPACE_CUSTOM_APPLICATION]: {
            conditionalAvailabilityExpression: null,
          },
        },
      }),
    });

    expect(flatPageLayoutWidget.conditionalAvailability).toEqual(
      deviceIs('MOBILE'),
    );
    expect(getDisplayedRule(flatPageLayoutWidget)).toEqual({
      conditionalAvailability: null,
      ...NO_LEGACY_RULE,
    });
  });

  it.each([
    [
      'text',
      { conditionalAvailabilityExpression: 'numberOfSelectedRecords - 1 == 0' },
      'INVALID_SYNTAX',
    ],
    [
      'json-logic',
      { conditionalDisplay: { '>': [{ var: 'count' }, 1] } },
      'UNSUPPORTED_CONDITIONAL_DISPLAY',
    ],
  ])(
    'should hide a widget whose %s rule cannot be read and give the reason',
    (_ruleKind, properties, reason) => {
      const { flatPageLayoutWidget, unreadableRuleReason } = computeOrThrow({
        flatPageLayoutWidget: buildPageLayoutWidget(properties),
      });

      expect(unreadableRuleReason).toBe(reason);
      expect(flatPageLayoutWidget).toMatchObject({
        conditionalAvailability: { type: 'LITERAL', value: false },
        ...NO_LEGACY_RULE,
      });
    },
  );

  it('should give a built-in widget storing no rule its built-in rule back', () => {
    expect(
      computeOrThrow({
        flatPageLayoutWidget: buildPageLayoutWidget({}),
        standardConditionalAvailability: deviceIs('MOBILE'),
      }).flatPageLayoutWidget,
    ).toEqual(
      buildPageLayoutWidget({
        conditionalAvailability: deviceIs('MOBILE'),
        updatedAt: NOW,
      }),
    );
  });

  it.each([
    ['a widget with no rule', buildPageLayoutWidget({}), undefined],
    [
      'a converted rule',
      computeOrThrow({
        flatPageLayoutWidget: buildPageLayoutWidget({
          conditionalAvailabilityExpression: 'device == "MOBILE"',
          conditionalDisplay: MOBILE_JSON_LOGIC,
        }),
      }).flatPageLayoutWidget,
      undefined,
    ],
    [
      'a converted override',
      computeOrThrow({
        flatPageLayoutWidget: buildPageLayoutWidget({
          conditionalAvailabilityExpression: 'device == "MOBILE"',
          overrides: {
            [WORKSPACE_CUSTOM_APPLICATION]: {
              conditionalAvailabilityExpression: 'device == "DESKTOP"',
            },
          },
        }),
      }).flatPageLayoutWidget,
      undefined,
    ],
    [
      'a restored built-in rule',
      computeOrThrow({
        flatPageLayoutWidget: buildPageLayoutWidget({}),
        standardConditionalAvailability: deviceIs('MOBILE'),
      }).flatPageLayoutWidget,
      deviceIs('MOBILE'),
    ],
  ])(
    'should change nothing on %s',
    (_description, flatPageLayoutWidget, standardConditionalAvailability) => {
      expect(
        compute({ flatPageLayoutWidget, standardConditionalAvailability }),
      ).toBeNull();
    },
  );
});
