import { buildWidgetVisibilityContext } from '@/page-layout/utils/buildWidgetVisibilityContext';

describe('buildWidgetVisibilityContext', () => {
  it('should return MOBILE device when isMobile is true', () => {
    const result = buildWidgetVisibilityContext({
      isMobile: true,
      isInSidePanel: false,
    });

    expect(result).toEqual({ device: 'MOBILE', selectedRecords: [] });
  });

  it('should return MOBILE device when isInSidePanel is true', () => {
    const result = buildWidgetVisibilityContext({
      isMobile: false,
      isInSidePanel: true,
    });

    expect(result).toEqual({ device: 'MOBILE', selectedRecords: [] });
  });

  it('should return MOBILE device when both isMobile and isInSidePanel are true', () => {
    const result = buildWidgetVisibilityContext({
      isMobile: true,
      isInSidePanel: true,
    });

    expect(result).toEqual({ device: 'MOBILE', selectedRecords: [] });
  });

  it('should return DESKTOP device when both are false', () => {
    const result = buildWidgetVisibilityContext({
      isMobile: false,
      isInSidePanel: false,
    });

    expect(result).toEqual({ device: 'DESKTOP', selectedRecords: [] });
  });

  it('should pass through selectedRecords', () => {
    const result = buildWidgetVisibilityContext({
      isMobile: false,
      isInSidePanel: false,
      selectedRecords: [{ id: 'a', status: 'DRAFT' }],
    });

    expect(result).toEqual({
      device: 'DESKTOP',
      selectedRecords: [{ id: 'a', status: 'DRAFT' }],
    });
  });
});
