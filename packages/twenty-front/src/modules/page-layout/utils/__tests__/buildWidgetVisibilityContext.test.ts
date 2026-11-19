import { EMPTY_CONDITIONAL_AVAILABILITY_GLOBAL_CONTEXT } from '@/page-layout/testing/EmptyConditionalAvailabilityGlobalContext';
import { buildWidgetVisibilityContext } from '@/page-layout/utils/buildWidgetVisibilityContext';
import {
  type ConditionalAvailabilityGlobalContext,
  type ConditionalAvailabilityNode,
} from 'twenty-shared/types';
import { evaluateConditionalAvailabilityNode } from 'twenty-shared/utils';

const LOADED_GLOBAL_CONTEXT: ConditionalAvailabilityGlobalContext = {
  featureFlags: { IS_AI_CHAT_INBOX_ENABLED: true },
  permissionFlags: { LAYOUTS: true },
  currentRole: { universalIdentifier: 'sales-role-universal-identifier' },
  currentWorkspaceMember: { id: 'workspace-member-id' },
};

const ROLE_IS_SALES: ConditionalAvailabilityNode = {
  type: 'COMPARISON',
  operator: 'EQUAL',
  left: { type: 'PATH', path: 'currentRole.universalIdentifier' },
  right: { type: 'LITERAL', value: 'sales-role-universal-identifier' },
};

describe('buildWidgetVisibilityContext', () => {
  it('should return MOBILE device when isMobile is true', () => {
    const result = buildWidgetVisibilityContext({
      globalContext: EMPTY_CONDITIONAL_AVAILABILITY_GLOBAL_CONTEXT,
      isMobile: true,
      isInSidePanel: false,
    });

    expect(result).toEqual({
      ...EMPTY_CONDITIONAL_AVAILABILITY_GLOBAL_CONTEXT,
      device: 'MOBILE',
      selectedRecords: [],
    });
  });

  it('should return MOBILE device when isInSidePanel is true', () => {
    const result = buildWidgetVisibilityContext({
      globalContext: EMPTY_CONDITIONAL_AVAILABILITY_GLOBAL_CONTEXT,
      isMobile: false,
      isInSidePanel: true,
    });

    expect(result.device).toBe('MOBILE');
  });

  it('should return MOBILE device when both isMobile and isInSidePanel are true', () => {
    const result = buildWidgetVisibilityContext({
      globalContext: EMPTY_CONDITIONAL_AVAILABILITY_GLOBAL_CONTEXT,
      isMobile: true,
      isInSidePanel: true,
    });

    expect(result.device).toBe('MOBILE');
  });

  it('should return DESKTOP device when both are false', () => {
    const result = buildWidgetVisibilityContext({
      globalContext: EMPTY_CONDITIONAL_AVAILABILITY_GLOBAL_CONTEXT,
      isMobile: false,
      isInSidePanel: false,
    });

    expect(result.device).toBe('DESKTOP');
  });

  it('should expose the target record as a single-record selection', () => {
    const result = buildWidgetVisibilityContext({
      globalContext: EMPTY_CONDITIONAL_AVAILABILITY_GLOBAL_CONTEXT,
      isMobile: false,
      isInSidePanel: false,
      targetRecord: { id: 'a', status: 'DRAFT' },
    });

    expect(result.selectedRecords).toEqual([{ id: 'a', status: 'DRAFT' }]);
  });

  it('should expose the flags, role and workspace member of the global context', () => {
    const result = buildWidgetVisibilityContext({
      globalContext: LOADED_GLOBAL_CONTEXT,
      isMobile: false,
      isInSidePanel: false,
    });

    expect(result).toMatchObject(LOADED_GLOBAL_CONTEXT);
  });

  it('should expose an empty selection when there is no target record', () => {
    const result = buildWidgetVisibilityContext({
      globalContext: EMPTY_CONDITIONAL_AVAILABILITY_GLOBAL_CONTEXT,
      isMobile: false,
      isInSidePanel: false,
      targetRecord: undefined,
    });

    expect(result.selectedRecords).toEqual([]);
  });

  it('should show a widget whose rule on the role holds', () => {
    expect(
      evaluateConditionalAvailabilityNode({
        node: ROLE_IS_SALES,
        context: buildWidgetVisibilityContext({
          globalContext: LOADED_GLOBAL_CONTEXT,
          isMobile: false,
          isInSidePanel: false,
        }),
      }),
    ).toBe(true);
  });
});
