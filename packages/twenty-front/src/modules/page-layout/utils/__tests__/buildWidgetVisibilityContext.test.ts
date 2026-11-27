import { EMPTY_CONDITIONAL_AVAILABILITY_CURRENT_USER_CONTEXT } from '@/conditional-availability/constants/EmptyConditionalAvailabilityCurrentUserContext';
import { buildWidgetVisibilityContext } from '@/page-layout/utils/buildWidgetVisibilityContext';

describe('buildWidgetVisibilityContext', () => {
  it('should return MOBILE device when isMobile is true', () => {
    const result = buildWidgetVisibilityContext({
      isMobile: true,
      isInSidePanel: false,
      currentUserContext: EMPTY_CONDITIONAL_AVAILABILITY_CURRENT_USER_CONTEXT,
    });

    expect(result).toEqual({
      device: 'MOBILE',
      selectedRecords: [],
      ...EMPTY_CONDITIONAL_AVAILABILITY_CURRENT_USER_CONTEXT,
    });
  });

  it('should return MOBILE device when isInSidePanel is true', () => {
    const result = buildWidgetVisibilityContext({
      isMobile: false,
      isInSidePanel: true,
      currentUserContext: EMPTY_CONDITIONAL_AVAILABILITY_CURRENT_USER_CONTEXT,
    });

    expect(result).toEqual({
      device: 'MOBILE',
      selectedRecords: [],
      ...EMPTY_CONDITIONAL_AVAILABILITY_CURRENT_USER_CONTEXT,
    });
  });

  it('should return MOBILE device when both isMobile and isInSidePanel are true', () => {
    const result = buildWidgetVisibilityContext({
      isMobile: true,
      isInSidePanel: true,
      currentUserContext: EMPTY_CONDITIONAL_AVAILABILITY_CURRENT_USER_CONTEXT,
    });

    expect(result).toEqual({
      device: 'MOBILE',
      selectedRecords: [],
      ...EMPTY_CONDITIONAL_AVAILABILITY_CURRENT_USER_CONTEXT,
    });
  });

  it('should return DESKTOP device when both are false', () => {
    const result = buildWidgetVisibilityContext({
      isMobile: false,
      isInSidePanel: false,
      currentUserContext: EMPTY_CONDITIONAL_AVAILABILITY_CURRENT_USER_CONTEXT,
    });

    expect(result).toEqual({
      device: 'DESKTOP',
      selectedRecords: [],
      ...EMPTY_CONDITIONAL_AVAILABILITY_CURRENT_USER_CONTEXT,
    });
  });

  it('should expose the target record as a single-record selection', () => {
    const result = buildWidgetVisibilityContext({
      isMobile: false,
      isInSidePanel: false,
      targetRecord: { id: 'a', status: 'DRAFT' },
      currentUserContext: EMPTY_CONDITIONAL_AVAILABILITY_CURRENT_USER_CONTEXT,
    });

    expect(result).toEqual({
      device: 'DESKTOP',
      selectedRecords: [{ id: 'a', status: 'DRAFT' }],
      ...EMPTY_CONDITIONAL_AVAILABILITY_CURRENT_USER_CONTEXT,
    });
  });

  it('should expose the workspace feature flags', () => {
    const result = buildWidgetVisibilityContext({
      isMobile: false,
      isInSidePanel: false,
      currentUserContext: {
        ...EMPTY_CONDITIONAL_AVAILABILITY_CURRENT_USER_CONTEXT,
        featureFlags: { IS_AI_CHAT_INBOX_ENABLED: true },
      },
    });

    expect(result.featureFlags).toEqual({ IS_AI_CHAT_INBOX_ENABLED: true });
  });

  it('should expose an empty selection when there is no target record', () => {
    const result = buildWidgetVisibilityContext({
      isMobile: false,
      isInSidePanel: false,
      targetRecord: undefined,
      currentUserContext: EMPTY_CONDITIONAL_AVAILABILITY_CURRENT_USER_CONTEXT,
    });

    expect(result.selectedRecords).toEqual([]);
  });
});
