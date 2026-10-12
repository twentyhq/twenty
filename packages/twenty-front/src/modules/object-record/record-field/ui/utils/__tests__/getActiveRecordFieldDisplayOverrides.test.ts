import { type CurrentWorkspace } from '@/auth/states/currentWorkspaceState';
import { type RecordFieldDisplayOverride } from '@/object-record/record-field/ui/types/RecordFieldDisplayOverride';
import { getActiveRecordFieldDisplayOverrides } from '@/object-record/record-field/ui/utils/getActiveRecordFieldDisplayOverrides';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

const COMPANY_OWNER_OVERRIDE: RecordFieldDisplayOverride = {
  objectNameSingular: 'company',
  fieldName: 'owner',
  featureFlagKey: FeatureFlagKey.IS_WORKFLOW_CORE_INDEX_PAGE_ENABLED,
  recordGqlFields: { ownerExternalId: true },
  DisplayComponent: jest.fn(),
};

const buildWorkspace = (isFeatureFlagEnabled: boolean) =>
  ({
    featureFlags: [
      {
        key: FeatureFlagKey.IS_WORKFLOW_CORE_INDEX_PAGE_ENABLED,
        value: isFeatureFlagEnabled,
      },
    ],
  }) as CurrentWorkspace;

describe('getActiveRecordFieldDisplayOverrides', () => {
  it('should return the override of a displayed field when its feature flag is on', () => {
    expect(
      getActiveRecordFieldDisplayOverrides({
        recordFieldDisplayOverrides: [COMPANY_OWNER_OVERRIDE],
        objectNameSingular: 'company',
        fieldNames: ['name', 'owner'],
        currentWorkspace: buildWorkspace(true),
      }),
    ).toEqual([COMPANY_OWNER_OVERRIDE]);
  });

  it('should return nothing when the feature flag is off', () => {
    expect(
      getActiveRecordFieldDisplayOverrides({
        recordFieldDisplayOverrides: [COMPANY_OWNER_OVERRIDE],
        objectNameSingular: 'company',
        fieldNames: ['owner'],
        currentWorkspace: buildWorkspace(false),
      }),
    ).toEqual([]);
  });

  it('should return nothing without a current workspace', () => {
    expect(
      getActiveRecordFieldDisplayOverrides({
        recordFieldDisplayOverrides: [COMPANY_OWNER_OVERRIDE],
        objectNameSingular: 'company',
        fieldNames: ['owner'],
        currentWorkspace: undefined,
      }),
    ).toEqual([]);
  });

  it('should return nothing for a field without override', () => {
    expect(
      getActiveRecordFieldDisplayOverrides({
        recordFieldDisplayOverrides: [COMPANY_OWNER_OVERRIDE],
        objectNameSingular: 'company',
        fieldNames: ['name'],
        currentWorkspace: buildWorkspace(true),
      }),
    ).toEqual([]);
  });

  it('should return nothing for the same field name on another object', () => {
    expect(
      getActiveRecordFieldDisplayOverrides({
        recordFieldDisplayOverrides: [COMPANY_OWNER_OVERRIDE],
        objectNameSingular: 'opportunity',
        fieldNames: ['owner'],
        currentWorkspace: buildWorkspace(true),
      }),
    ).toEqual([]);
  });
});
