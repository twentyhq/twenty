import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import { type FieldJsonValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { STANDARD_OBJECT_FIELDS } from 'twenty-shared/metadata';
import { mockedUserData } from '~/testing/mock-data/users';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';
import { setTestObjectMetadataItemsInMetadataStore } from '~/testing/utils/setTestObjectMetadataItemsInMetadataStore';

const WORKFLOW_RUN_METADATA = getMockObjectMetadataItemOrThrow('workflowRun');
const RAW_JSON_METADATA = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: WORKFLOW_RUN_METADATA,
  fieldName: 'state',
});

const TRANSCRIPT_METADATA = {
  ...RAW_JSON_METADATA,
  name: 'transcript',
  label: 'Transcript',
  isUIEditable: false,
  isNullable: true,
  settings: { isValueLoadedOnOpen: true },
  universalIdentifier:
    STANDARD_OBJECT_FIELDS.callRecording.transcript.universalIdentifier,
};

export const ON_DEMAND_FIELD_STORY_OBJECT_METADATA: EnrichedObjectMetadataItem =
  {
    ...WORKFLOW_RUN_METADATA,
    nameSingular: 'callRecording',
    namePlural: 'callRecordings',
    labelSingular: 'Call recording',
    labelPlural: 'Call recordings',
    fields: WORKFLOW_RUN_METADATA.fields.map((field) =>
      field.id === TRANSCRIPT_METADATA.id ? TRANSCRIPT_METADATA : field,
    ),
  };

export const ON_DEMAND_FIELD_STORY_DEFINITION =
  formatFieldMetadataItemAsColumnDefinition({
    field: TRANSCRIPT_METADATA,
    objectMetadataItem: ON_DEMAND_FIELD_STORY_OBJECT_METADATA,
    position: 1,
  });

export const ON_DEMAND_FIELD_STORY_EDITABLE_OBJECT_METADATA: EnrichedObjectMetadataItem =
  {
    ...ON_DEMAND_FIELD_STORY_OBJECT_METADATA,
    isUIEditable: true,
    fields: ON_DEMAND_FIELD_STORY_OBJECT_METADATA.fields.map((field) =>
      field.id === TRANSCRIPT_METADATA.id
        ? {
            ...field,
            isUIEditable: true,
            isCustom: true,
            universalIdentifier: 'a97f446e-064e-4c6e-b85c-76acbfb84d22',
          }
        : field,
    ),
  };

export const ON_DEMAND_FIELD_STORY_EDITABLE_DEFINITION =
  formatFieldMetadataItemAsColumnDefinition({
    field: getMockFieldMetadataItemOrThrow({
      objectMetadataItem: ON_DEMAND_FIELD_STORY_EDITABLE_OBJECT_METADATA,
      fieldName: 'transcript',
    }),
    objectMetadataItem: ON_DEMAND_FIELD_STORY_EDITABLE_OBJECT_METADATA,
    position: 1,
  });

export const ON_DEMAND_FIELD_STORY_RECORD_ID =
  '36d325f0-6932-4e9b-bab6-8e397fb01d48';
export const ON_DEMAND_FIELD_STORY_UPDATED_AT = '2026-01-01T00:00:00.000Z';

export const seedOnDemandFieldStory = (
  options: {
    value?: FieldJsonValue;
    isEditable?: boolean;
    isRecordSeedingEnabled?: boolean;
  } = {},
) => {
  setTestObjectMetadataItemsInMetadataStore(
    jotaiStore,
    getTestEnrichedObjectMetadataItemsMock().map((objectMetadataItem) =>
      objectMetadataItem.id === ON_DEMAND_FIELD_STORY_OBJECT_METADATA.id
        ? options.isEditable
          ? ON_DEMAND_FIELD_STORY_EDITABLE_OBJECT_METADATA
          : ON_DEMAND_FIELD_STORY_OBJECT_METADATA
        : objectMetadataItem,
    ),
  );
  jotaiStore.set(currentWorkspaceState.atom, {
    ...mockedUserData.currentWorkspace,
    workspaceCustomApplication:
      mockedUserData.currentWorkspace.workspaceCustomApplication ?? null,
    installedApplications: [],
  });
  jotaiStore.set(
    currentWorkspaceMemberState.atom,
    mockedUserData.workspaceMember,
  );
  jotaiStore.set(
    currentUserWorkspaceState.atom,
    mockedUserData.currentUserWorkspace,
  );

  if (options.isRecordSeedingEnabled === false) {
    return;
  }

  jotaiStore.set(
    recordStoreFamilyState.atomFamily(ON_DEMAND_FIELD_STORY_RECORD_ID),
    {
      id: ON_DEMAND_FIELD_STORY_RECORD_ID,
      __typename: 'CallRecording',
      name: 'Customer call',
      updatedAt: ON_DEMAND_FIELD_STORY_UPDATED_AT,
      ...(Object.hasOwn(options, 'value') ? { transcript: options.value } : {}),
    },
  );
};
