import { buildWidgetVisibilityContext } from '@/page-layout/utils/buildWidgetVisibilityContext';

describe('buildWidgetVisibilityContext', () => {
  it('should return MOBILE device when isMobile is true', () => {
    const result = buildWidgetVisibilityContext({
      isMobile: true,
      isInSidePanel: false,
    });

    expect(result).toEqual({
      device: 'MOBILE',
      selectedRecords: [],
      featureFlags: {},
    });
  });

  it('should return MOBILE device when isInSidePanel is true', () => {
    const result = buildWidgetVisibilityContext({
      isMobile: false,
      isInSidePanel: true,
    });

    expect(result).toEqual({
      device: 'MOBILE',
      selectedRecords: [],
      featureFlags: {},
    });
  });

  it('should return MOBILE device when both isMobile and isInSidePanel are true', () => {
    const result = buildWidgetVisibilityContext({
      isMobile: true,
      isInSidePanel: true,
    });

    expect(result).toEqual({
      device: 'MOBILE',
      selectedRecords: [],
      featureFlags: {},
    });
  });

  it('should return DESKTOP device when both are false', () => {
    const result = buildWidgetVisibilityContext({
      isMobile: false,
      isInSidePanel: false,
    });

    expect(result).toEqual({
      device: 'DESKTOP',
      selectedRecords: [],
      featureFlags: {},
    });
  });

  it('should expose the target record as a single-record selection', () => {
    const result = buildWidgetVisibilityContext({
      isMobile: false,
      isInSidePanel: false,
      targetRecord: { id: 'a', status: 'DRAFT' },
    });

    expect(result).toEqual({
      device: 'DESKTOP',
      selectedRecords: [{ id: 'a', status: 'DRAFT' }],
      featureFlags: {},
    });
  });

  it('should expose the workspace feature flags', () => {
    const result = buildWidgetVisibilityContext({
      isMobile: false,
      isInSidePanel: false,
      featureFlags: { IS_MESSAGES_TAB_ENABLED: true },
    });

    expect(result.featureFlags).toEqual({ IS_MESSAGES_TAB_ENABLED: true });
  });

  it('should expose an empty selection when there is no target record', () => {
    const result = buildWidgetVisibilityContext({
      isMobile: false,
      isInSidePanel: false,
      targetRecord: undefined,
    });

    expect(result.selectedRecords).toEqual([]);
  });
});
