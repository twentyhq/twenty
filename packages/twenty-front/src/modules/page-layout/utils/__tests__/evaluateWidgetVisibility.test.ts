import {
  type ConditionalDisplay,
  ViewFilterOperand,
} from 'twenty-shared/types';

import { type WidgetVisibilityContext } from '@/page-layout/types/WidgetVisibilityContext';
import { evaluateWidgetVisibility } from '@/page-layout/utils/evaluateWidgetVisibility';

const buildContext = (
  device: WidgetVisibilityContext['device'],
): WidgetVisibilityContext => ({
  device,
  selectedRecords: [],
  featureFlags: {},
  currentRoleId: null,
  currentWorkspaceMemberId: null,
  objectMetadataItems: [],
});

const buildDeviceConditionalDisplay = (
  device: WidgetVisibilityContext['device'],
): ConditionalDisplay => ({
  recordFilters: [
    {
      id: 'device-filter',
      contextKey: 'device',
      operand: ViewFilterOperand.IS,
      value: JSON.stringify([device]),
    },
  ],
});

describe('evaluateWidgetVisibility', () => {
  it('should return true (visible) when no conditionalDisplay is provided', () => {
    const result = evaluateWidgetVisibility({
      conditionalAvailabilityExpression: undefined,
      conditionalDisplay: undefined,
      context: buildContext('DESKTOP'),
    });

    expect(result).toBe(true);
  });

  it('should return true (visible) when the device rule matches MOBILE', () => {
    const result = evaluateWidgetVisibility({
      conditionalAvailabilityExpression: undefined,
      conditionalDisplay: buildDeviceConditionalDisplay('MOBILE'),
      context: buildContext('MOBILE'),
    });

    expect(result).toBe(true);
  });

  it('should return false (hidden) when the device rule does not match DESKTOP', () => {
    const result = evaluateWidgetVisibility({
      conditionalAvailabilityExpression: undefined,
      conditionalDisplay: buildDeviceConditionalDisplay('MOBILE'),
      context: buildContext('DESKTOP'),
    });

    expect(result).toBe(false);
  });

  it('should return true (visible) when the device rule allows both devices', () => {
    const conditionalDisplay: ConditionalDisplay = {
      recordFilters: [
        {
          id: 'device-filter',
          contextKey: 'device',
          operand: ViewFilterOperand.IS,
          value: JSON.stringify(['MOBILE', 'DESKTOP']),
        },
      ],
    };

    const resultMobile = evaluateWidgetVisibility({
      conditionalAvailabilityExpression: undefined,
      conditionalDisplay,
      context: buildContext('MOBILE'),
    });

    const resultDesktop = evaluateWidgetVisibility({
      conditionalAvailabilityExpression: undefined,
      conditionalDisplay,
      context: buildContext('DESKTOP'),
    });

    expect(resultMobile).toBe(true);
    expect(resultDesktop).toBe(true);
  });

  describe('conditionalAvailabilityExpression', () => {
    it('should return true when expression matches MOBILE device', () => {
      const result = evaluateWidgetVisibility({
        conditionalAvailabilityExpression: 'device == "MOBILE"',
        conditionalDisplay: undefined,
        context: buildContext('MOBILE'),
      });

      expect(result).toBe(true);
    });

    it('should return false when expression does not match MOBILE device', () => {
      const result = evaluateWidgetVisibility({
        conditionalAvailabilityExpression: 'device == "MOBILE"',
        conditionalDisplay: undefined,
        context: buildContext('DESKTOP'),
      });

      expect(result).toBe(false);
    });

    it('should hide the widget when the expression fails even if conditionalDisplay matches', () => {
      const result = evaluateWidgetVisibility({
        conditionalAvailabilityExpression: 'device == "MOBILE"',
        conditionalDisplay: buildDeviceConditionalDisplay('DESKTOP'),
        context: buildContext('DESKTOP'),
      });

      expect(result).toBe(false);
    });

    it('should fall through to conditionalDisplay when expression is null', () => {
      const result = evaluateWidgetVisibility({
        conditionalAvailabilityExpression: null,
        conditionalDisplay: buildDeviceConditionalDisplay('MOBILE'),
        context: buildContext('DESKTOP'),
      });

      expect(result).toBe(false);
    });
  });
});
