import { useCommandMenuItemsFromBackend } from '@/command-menu-item/server-items/common/hooks/useCommandMenuItemsFromBackend';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { renderHook } from '@testing-library/react';
import {
  CommandMenuContextApiPageType,
  type CommandMenuContextApi,
} from 'twenty-shared/types';
import { Icon123 } from 'twenty-ui/display';
import {
  CommandMenuItemAvailabilityType,
  type CommandMenuItemFieldsFragment,
  EngineComponentKey,
} from '~/generated-metadata/graphql';

jest.mock('@/ui/utilities/state/jotai/hooks/useAtomStateValue');
jest.mock('twenty-ui/display', () => ({
  ...jest.requireActual('twenty-ui/display'),
  useIcons: () => ({
    getIcon: () => Icon123,
  }),
}));
jest.mock('twenty-shared/utils', () => {
  const actual = jest.requireActual('twenty-shared/utils');

  return {
    ...actual,
    interpolateCommandMenuItemLabel: jest.fn(
      ({ label }: { label?: string | null }) => label ?? null,
    ),
    evaluateConditionalAvailabilityExpression: jest.fn(
      (expression?: string | null) => expression !== 'hide',
    ),
  };
});

const mockedUseAtomStateValue = jest.mocked(useAtomStateValue);

const getCommandMenuContextApi = (
  numberOfSelectedRecords: number,
): CommandMenuContextApi => ({
  pageType: CommandMenuContextApiPageType.INDEX_PAGE,
  isInSidePanel: false,
  isPageInEditMode: false,
  favoriteRecordIds: [],
  isSelectAll: false,
  hasAnySoftDeleteFilterOnView: false,
  objectMetadataItem: {
    id: 'company-id',
  },
  objectMetadataLabel: 'Company',
  numberOfSelectedRecords,
  objectPermissions: {
    objectMetadataId: 'company-id',
    canReadObjectRecords: true,
    canUpdateObjectRecords: true,
    canSoftDeleteObjectRecords: true,
    canDestroyObjectRecords: true,
    restrictedFields: {},
    rowLevelPermissionPredicates: [],
    rowLevelPermissionPredicateGroups: [],
  },
  selectedRecords: [],
  featureFlags: {},
  targetObjectReadPermissions: {},
  targetObjectWritePermissions: {},
});

const buildCommandMenuItem = ({
  id,
  position,
  availabilityType,
  expression,
  isPinned = true,
}: {
  id: string;
  position: number;
  availabilityType: CommandMenuItemAvailabilityType;
  expression?: string;
  isPinned?: boolean;
}): CommandMenuItemFieldsFragment => ({
  id,
  label: id,
  shortLabel: `${id}-short`,
  icon: 'Icon123',
  position,
  isPinned,
  hotKeys: null,
  engineComponentKey: EngineComponentKey.CREATE_NEW_RECORD,
  frontComponentId: null,
  workflowVersionId: null,
  availabilityType,
  availabilityObjectMetadataId: 'company-id',
  conditionalAvailabilityExpression: expression ?? null,
});

describe('useCommandMenuItemsFromBackend', () => {
  it('filters out items hidden by conditional availability expression', () => {
    mockedUseAtomStateValue.mockReturnValue([
      buildCommandMenuItem({
        id: 'global-visible',
        position: 1,
        availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
      }),
      buildCommandMenuItem({
        id: 'global-hidden',
        position: 2,
        availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
        expression: 'hide',
      }),
      buildCommandMenuItem({
        id: 'record-visible',
        position: 3,
        availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
      }),
    ]);

    const { result } = renderHook(() =>
      useCommandMenuItemsFromBackend(getCommandMenuContextApi(0)),
    );

    expect(result.current.map((item) => item.id)).toEqual(['global-visible']);
  });

  it('maps global, record selection and fallback items to V2 output', () => {
    mockedUseAtomStateValue.mockReturnValue([
      buildCommandMenuItem({
        id: 'global-item',
        position: 2,
        availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
      }),
      buildCommandMenuItem({
        id: 'record-item',
        position: 1,
        availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
      }),
      buildCommandMenuItem({
        id: 'fallback-item',
        position: 3,
        availabilityType: CommandMenuItemAvailabilityType.FALLBACK,
      }),
    ]);

    const { result } = renderHook(() =>
      useCommandMenuItemsFromBackend(getCommandMenuContextApi(1)),
    );

    expect(result.current.map((item) => item.id)).toEqual([
      'record-item',
      'global-item',
      'fallback-item',
    ]);
    expect(result.current[2].isPinned).toBe(false);
  });
});
