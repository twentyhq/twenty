import { type CurrentWorkspace } from '@/auth/states/currentWorkspaceState';
import { type RecordFieldDisplayOverride } from '@/object-record/record-field/ui/types/RecordFieldDisplayOverride';
import { getRecordFieldDisplayOverridesRecordGqlFields } from '@/object-record/record-field/ui/utils/getRecordFieldDisplayOverridesRecordGqlFields';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

const RECORD_FIELD_DISPLAY_OVERRIDES: RecordFieldDisplayOverride[] = [
  {
    objectNameSingular: 'company',
    fieldName: 'owner',
    featureFlagKey: FeatureFlagKey.IS_WORKFLOW_CORE_INDEX_PAGE_ENABLED,
    recordGqlFields: { ownerExternalId: true },
    DisplayComponent: jest.fn(),
  },
  {
    objectNameSingular: 'company',
    fieldName: 'parent',
    featureFlagKey: FeatureFlagKey.IS_WORKFLOW_CORE_INDEX_PAGE_ENABLED,
    recordGqlFields: { ownerExternalId: true, parentExternalId: true },
    DisplayComponent: jest.fn(),
  },
];

const buildWorkspace = (isFeatureFlagEnabled: boolean) =>
  ({
    featureFlags: [
      {
        key: FeatureFlagKey.IS_WORKFLOW_CORE_INDEX_PAGE_ENABLED,
        value: isFeatureFlagEnabled,
      },
    ],
  }) as CurrentWorkspace;

describe('getRecordFieldDisplayOverridesRecordGqlFields', () => {
  it('should request the fields needed by the overrides of the requested fields', () => {
    expect(
      getRecordFieldDisplayOverridesRecordGqlFields({
        recordFieldDisplayOverrides: RECORD_FIELD_DISPLAY_OVERRIDES,
        objectNameSingular: 'company',
        fieldNames: ['name', 'owner', 'parent'],
        currentWorkspace: buildWorkspace(true),
      }),
    ).toEqual({ ownerExternalId: true, parentExternalId: true });
  });

  it('should only request the fields of overrides whose field is requested', () => {
    expect(
      getRecordFieldDisplayOverridesRecordGqlFields({
        recordFieldDisplayOverrides: RECORD_FIELD_DISPLAY_OVERRIDES,
        objectNameSingular: 'company',
        fieldNames: ['owner'],
        currentWorkspace: buildWorkspace(true),
      }),
    ).toEqual({ ownerExternalId: true });
  });

  it('should request nothing more when the feature flag is off', () => {
    expect(
      getRecordFieldDisplayOverridesRecordGqlFields({
        recordFieldDisplayOverrides: RECORD_FIELD_DISPLAY_OVERRIDES,
        objectNameSingular: 'company',
        fieldNames: ['owner', 'parent'],
        currentWorkspace: buildWorkspace(false),
      }),
    ).toEqual({});
  });
});
