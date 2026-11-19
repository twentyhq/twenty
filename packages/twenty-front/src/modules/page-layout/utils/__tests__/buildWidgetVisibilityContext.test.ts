import { buildWidgetVisibilityContext } from '@/page-layout/utils/buildWidgetVisibilityContext';
import {
  type ConditionalAvailabilityGlobalContext,
  type ConditionalAvailabilityNode,
} from 'twenty-shared/types';
import { evaluateConditionalAvailabilityNode } from 'twenty-shared/utils';

const EMPTY_GLOBAL_CONTEXT: ConditionalAvailabilityGlobalContext = {
  featureFlags: {},
  permissionFlags: {},
  currentRole: null,
  currentWorkspaceMember: null,
};

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

const MEMBER_IS_NOT_OTHER: ConditionalAvailabilityNode = {
  type: 'COMPARISON',
  operator: 'NOT_EQUAL',
  left: { type: 'PATH', path: 'currentWorkspaceMember.id' },
  right: { type: 'LITERAL', value: 'other-workspace-member-id' },
};

const CAN_EDIT_LAYOUTS: ConditionalAvailabilityNode = {
  type: 'COMPARISON',
  operator: 'EQUAL',
  left: { type: 'PATH', path: 'permissionFlags.LAYOUTS' },
  right: { type: 'LITERAL', value: true },
};

const isVisible = ({
  node,
  globalContext,
}: {
  node: ConditionalAvailabilityNode;
  globalContext: ConditionalAvailabilityGlobalContext;
}) =>
  evaluateConditionalAvailabilityNode({
    node,
    context: buildWidgetVisibilityContext({
      globalContext,
      isMobile: false,
      isInSidePanel: false,
    }),
  });

describe('buildWidgetVisibilityContext', () => {
  it('should return MOBILE device when isMobile is true', () => {
    const result = buildWidgetVisibilityContext({
      globalContext: EMPTY_GLOBAL_CONTEXT,
      isMobile: true,
      isInSidePanel: false,
    });

    expect(result).toEqual({
      ...EMPTY_GLOBAL_CONTEXT,
      device: 'MOBILE',
      selectedRecords: [],
    });
  });

  it('should return MOBILE device when isInSidePanel is true', () => {
    const result = buildWidgetVisibilityContext({
      globalContext: EMPTY_GLOBAL_CONTEXT,
      isMobile: false,
      isInSidePanel: true,
    });

    expect(result.device).toBe('MOBILE');
  });

  it('should return MOBILE device when both isMobile and isInSidePanel are true', () => {
    const result = buildWidgetVisibilityContext({
      globalContext: EMPTY_GLOBAL_CONTEXT,
      isMobile: true,
      isInSidePanel: true,
    });

    expect(result.device).toBe('MOBILE');
  });

  it('should return DESKTOP device when both are false', () => {
    const result = buildWidgetVisibilityContext({
      globalContext: EMPTY_GLOBAL_CONTEXT,
      isMobile: false,
      isInSidePanel: false,
    });

    expect(result.device).toBe('DESKTOP');
  });

  it('should expose the target record as a single-record selection', () => {
    const result = buildWidgetVisibilityContext({
      globalContext: EMPTY_GLOBAL_CONTEXT,
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
      globalContext: EMPTY_GLOBAL_CONTEXT,
      isMobile: false,
      isInSidePanel: false,
      targetRecord: undefined,
    });

    expect(result.selectedRecords).toEqual([]);
  });

  it.each([
    ['the role', ROLE_IS_SALES],
    ['the workspace member', MEMBER_IS_NOT_OTHER],
    ['a permission flag', CAN_EDIT_LAYOUTS],
  ])('should show a widget whose rule on %s holds', (_subject, node) => {
    expect(isVisible({ node, globalContext: LOADED_GLOBAL_CONTEXT })).toBe(
      true,
    );
  });

  it('should hide a widget whose rule on the role does not hold', () => {
    expect(
      isVisible({
        node: ROLE_IS_SALES,
        globalContext: {
          ...LOADED_GLOBAL_CONTEXT,
          currentRole: {
            universalIdentifier: 'admin-role-universal-identifier',
          },
        },
      }),
    ).toBe(false);
  });

  it.each([
    ['the role', ROLE_IS_SALES],
    ['the workspace member', MEMBER_IS_NOT_OTHER],
  ])(
    'should hide a widget with a rule on %s while none is loaded',
    (_subject, node) => {
      expect(isVisible({ node, globalContext: EMPTY_GLOBAL_CONTEXT })).toBe(
        false,
      );
    },
  );
});
