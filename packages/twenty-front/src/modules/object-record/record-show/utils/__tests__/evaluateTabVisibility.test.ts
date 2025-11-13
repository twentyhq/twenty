import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import {
  type TabVisibilityContext,
  evaluateTabVisibility,
} from '@/object-record/record-show/utils/evaluateTabVisibility';
import { type ObjectPermissions } from 'twenty-shared/types';
import { FeatureFlagKey, FieldMetadataType } from '~/generated/graphql';

const makeObjectMetadataItem = (
  overrides: Partial<ObjectMetadataItem> = {},
): ObjectMetadataItem => {
  return {
    id: '1',
    nameSingular: CoreObjectNameSingular.Company,
    namePlural: 'companies',
    labelSingular: 'Company',
    labelPlural: 'Companies',
    isActive: true,
    isCustom: false,
    isLabelSyncedWithName: false,
    isRemote: false,
    isSearchable: true,
    isSystem: false,
    isUIReadOnly: false,
    createdAt: '',
    updatedAt: '',
    description: '',
    fields: [],
    readableFields: [],
    updatableFields: [],
    labelIdentifierFieldMetadataId: '',
    indexMetadatas: [],
    icon: '',
    shortcut: '',
    standardOverrides: undefined,
    imageIdentifierFieldMetadataId: undefined,
    duplicateCriteria: undefined,
    ...overrides,
  };
};

const makeObjectPermissions = (
  overrides: Partial<ObjectPermissions> = {},
): ObjectPermissions => {
  return {
    canReadObjectRecords: true,
    canUpdateObjectRecords: true,
    canSoftDeleteObjectRecords: true,
    canDestroyObjectRecords: true,
    restrictedFields: {},
    ...overrides,
  };
};

describe('evaluateTabVisibility', () => {
  const baseContext: TabVisibilityContext = {
    isMobile: false,
    isInRightDrawer: false,
    currentWorkspace: {
      featureFlags: [{ key: FeatureFlagKey.IS_AI_ENABLED, value: true }],
    },
    objectMetadataItems: [makeObjectMetadataItem()],
    objectPermissionsByObjectMetadataId: {
      '1': { ...makeObjectPermissions(), objectMetadataId: '1' },
    },
    targetObjectMetadataItem: makeObjectMetadataItem(),
  };

  const baseConfig = {
    ifMobile: false,
    ifDesktop: false,
    ifInRightDrawer: false,
    ifFeaturesDisabled: [],
    ifRequiredObjectsInactive: [],
    ifRelationsMissing: [],
  };

  it('returns true if ifMobile and isMobile', () => {
    expect(
      evaluateTabVisibility(
        { ...baseConfig, ifMobile: true },
        { ...baseContext, isMobile: true },
      ),
    ).toBe(true);
  });

  it('returns true if ifDesktop and not isMobile', () => {
    expect(
      evaluateTabVisibility(
        { ...baseConfig, ifDesktop: true },
        { ...baseContext, isMobile: false },
      ),
    ).toBe(true);
  });

  it('returns true if ifInRightDrawer and isInRightDrawer', () => {
    expect(
      evaluateTabVisibility(
        { ...baseConfig, ifInRightDrawer: true },
        { ...baseContext, isInRightDrawer: true },
      ),
    ).toBe(true);
  });

  it('returns true if feature flag is disabled', () => {
    expect(
      evaluateTabVisibility(
        {
          ...baseConfig,
          ifFeaturesDisabled: [FeatureFlagKey.IS_PAGE_LAYOUT_ENABLED],
        },
        baseContext,
      ),
    ).toBe(true);
  });

  it('returns false if feature flag is enabled', () => {
    const ctx = {
      ...baseContext,
      currentWorkspace: {
        featureFlags: [
          { key: FeatureFlagKey.IS_AI_ENABLED, value: true },
          { key: FeatureFlagKey.IS_PAGE_LAYOUT_ENABLED, value: true },
        ],
      },
    };
    expect(
      evaluateTabVisibility(
        {
          ...baseConfig,
          ifFeaturesDisabled: [FeatureFlagKey.IS_PAGE_LAYOUT_ENABLED],
        },
        ctx,
      ),
    ).toBe(false);
  });

  it('returns true if required object is inactive', () => {
    const ctx = {
      ...baseContext,
      objectMetadataItems: [
        ...baseContext.objectMetadataItems,
        makeObjectMetadataItem({
          id: '2',
          nameSingular: CoreObjectNameSingular.Person,
          isActive: false,
        }),
      ],
    };
    expect(
      evaluateTabVisibility(
        {
          ...baseConfig,
          ifRequiredObjectsInactive: [CoreObjectNameSingular.Person],
        },
        ctx,
      ),
    ).toBe(true);
  });

  it('returns true if relation is missing', () => {
    const ctx = {
      ...baseContext,
      targetObjectMetadataItem: makeObjectMetadataItem({ fields: [] }),
    };
    expect(
      evaluateTabVisibility(
        { ...baseConfig, ifRelationsMissing: ['contact'] },
        ctx,
      ),
    ).toBe(true);
  });

  it('returns true if no read permission', () => {
    const ctx = {
      ...baseContext,
      objectMetadataItems: [
        ...baseContext.objectMetadataItems,
        makeObjectMetadataItem({
          id: '2',
          nameSingular: CoreObjectNameSingular.Person,
        }),
      ],
      objectPermissionsByObjectMetadataId: {
        ...baseContext.objectPermissionsByObjectMetadataId,
        '2': {
          ...makeObjectPermissions({ canReadObjectRecords: false }),
          objectMetadataId: '2',
        },
      },
    };
    expect(
      evaluateTabVisibility(
        {
          ...baseConfig,
          ifNoReadPermission: true,
          ifNoReadPermissionObject: CoreObjectNameSingular.Person,
        },
        ctx,
      ),
    ).toBe(true);
  });

  it('returns false if no hide conditions are met', () => {
    expect(evaluateTabVisibility(baseConfig, baseContext)).toBe(false);
  });

  it('returns false if required object is active', () => {
    expect(
      evaluateTabVisibility(
        {
          ...baseConfig,
          ifRequiredObjectsInactive: [CoreObjectNameSingular.Company],
        },
        baseContext,
      ),
    ).toBe(false);
  });

  it('returns false if relation exists and is active', () => {
    const ctx = {
      ...baseContext,
      targetObjectMetadataItem: makeObjectMetadataItem({
        fields: [
          {
            name: 'contact',
            type: FieldMetadataType.RELATION,
            isActive: true,
          } as any,
        ],
      }),
    };
    expect(
      evaluateTabVisibility(
        { ...baseConfig, ifRelationsMissing: ['contact'] },
        ctx,
      ),
    ).toBe(false);
  });

  it('returns false if read permission exists', () => {
    const ctx = {
      ...baseContext,
      objectMetadataItems: [
        ...baseContext.objectMetadataItems,
        makeObjectMetadataItem({
          id: '2',
          nameSingular: CoreObjectNameSingular.Person,
        }),
      ],
      objectPermissionsByObjectMetadataId: {
        ...baseContext.objectPermissionsByObjectMetadataId,
        '2': {
          ...makeObjectPermissions({ canReadObjectRecords: true }),
          objectMetadataId: '2',
        },
      },
    };
    expect(
      evaluateTabVisibility(
        {
          ...baseConfig,
          ifNoReadPermission: true,
          ifNoReadPermissionObject: CoreObjectNameSingular.Person,
        },
        ctx,
      ),
    ).toBe(false);
  });
});
