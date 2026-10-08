import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { seedOnDemandCollectionFieldStory } from '@/object-record/record-field/on-demand/testing/seedOnDemandCollectionFieldStory';
import {
  ON_DEMAND_FIELD_STORY_DEFINITION,
  ON_DEMAND_FIELD_STORY_OBJECT_METADATA,
} from '@/object-record/record-field/on-demand/testing/seedOnDemandFieldStory';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { ViewFilterOperand } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { mockedApolloClient } from '~/testing/mockedApolloClient';
import { mockedApolloCoreClient } from '~/testing/mockedApolloCoreClient';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';
import { setTestObjectMetadataItemsInMetadataStore } from '~/testing/utils/setTestObjectMetadataItemsInMetadataStore';

export const seedOnDemandCollectionQueryStory = async ({
  isOnDemandFieldsEnabled = true,
  isValueLoadedOnOpen = true,
  hasJsonFilter = false,
}: {
  isOnDemandFieldsEnabled?: boolean;
  isValueLoadedOnOpen?: boolean;
  hasJsonFilter?: boolean;
} = {}) => {
  await Promise.all([
    mockedApolloClient.clearStore(),
    mockedApolloCoreClient.clearStore(),
  ]);
  seedOnDemandCollectionFieldStory({ isRecordSeedingEnabled: false });

  const workspace = jotaiStore.get(currentWorkspaceState.atom);
  if (isDefined(workspace)) {
    jotaiStore.set(currentWorkspaceState.atom, {
      ...workspace,
      featureFlags: [
        ...(workspace.featureFlags ?? []),
        {
          key: FeatureFlagKey.IS_ON_DEMAND_FIELDS_ENABLED,
          value: isOnDemandFieldsEnabled,
        },
      ],
    });
  }

  setTestObjectMetadataItemsInMetadataStore(
    jotaiStore,
    getTestEnrichedObjectMetadataItemsMock().map((objectMetadataItem) =>
      objectMetadataItem.id === ON_DEMAND_FIELD_STORY_OBJECT_METADATA.id
        ? {
            ...ON_DEMAND_FIELD_STORY_OBJECT_METADATA,
            fields: ON_DEMAND_FIELD_STORY_OBJECT_METADATA.fields.map((field) =>
              field.id === ON_DEMAND_FIELD_STORY_DEFINITION.fieldMetadataId
                ? { ...field, settings: { isValueLoadedOnOpen } }
                : field,
            ),
          }
        : objectMetadataItem,
    ),
  );

  jotaiStore.set(
    currentRecordFiltersComponentState.atomFamily({
      instanceId: 'on-demand-story',
    }),
    hasJsonFilter
      ? [
          {
            id: 'transcript-filter',
            fieldMetadataId: ON_DEMAND_FIELD_STORY_DEFINITION.fieldMetadataId,
            type: 'RAW_JSON',
            operand: ViewFilterOperand.CONTAINS,
            value: 'customer',
            displayValue: 'customer',
            label: 'Transcript',
          },
        ]
      : [],
  );
};
