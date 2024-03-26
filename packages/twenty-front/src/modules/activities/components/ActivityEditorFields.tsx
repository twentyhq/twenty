import { useFragment } from '@apollo/client';
import styled from '@emotion/styled';
import gql from 'graphql-tag';
import { useRecoilState } from 'recoil';

import { useUpsertActivity } from '@/activities/hooks/useUpsertActivity';
import { ActivityTargetsInlineCell } from '@/activities/inline-cell/components/ActivityTargetsInlineCell';
import { Activity } from '@/activities/types/Activity';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFieldContext } from '@/object-record/hooks/useFieldContext';
import { useMapRecordRelationConnectionsToRelationRecords } from '@/object-record/hooks/useMapRecordRelationConnectionsToRelationRecords';
import {
  RecordUpdateHook,
  RecordUpdateHookParams,
} from '@/object-record/record-field/contexts/FieldContext';
import { RecordInlineCell } from '@/object-record/record-inline-cell/components/RecordInlineCell';
import { PropertyBox } from '@/object-record/record-inline-cell/property-box/components/PropertyBox';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { isDefined } from '~/utils/isDefined';
import { capitalize } from '~/utils/string/capitalize';

const StyledPropertyBox = styled(PropertyBox)`
  padding: 0;
`;

export const ActivityEditorFields = ({
  activityId,
}: {
  activityId: string;
}) => {
  const { upsertActivity } = useUpsertActivity();

  const ActivityFragment = gql`
    fragment ActivityFragment on Activity {
      __typename
      id
      activityTargets {
        edges {
          node {
            id
            __typename
            person {
              id
              __typename
              name {
                firstName
                lastName
              }
            }
            company {
              id
              __typename
              name
              domainName
            }
            opportunity {
              id
              __typename
            }
          }
        }
      }
    }
  `;

  const { mapRecordRelationConnectionsToRelationRecords } =
    useMapRecordRelationConnectionsToRelationRecords();

  const {
    data: activityFromCache,
    complete,
    missing,
  } = useFragment({
    fragment: ActivityFragment,
    fragmentName: 'ActivityFragment',
    from: {
      __typename: capitalize(CoreObjectNameSingular.Activity),
      id: activityId,
    },
    optimistic: true,
  });

  const activityFromCacheWithoutConnection =
    mapRecordRelationConnectionsToRelationRecords<Activity>({
      objectNameSingular: CoreObjectNameSingular.Activity,
      objectRecord: activityFromCache,
      depth: 3,
    });

  console.log({
    activityFromCache,
    activityFromCacheWithoutConnection,
  });

  const [activityFromStore] = useRecoilState(
    recordStoreFamilyState(activityId),
  );

  const activity = activityFromStore as Activity;

  const useUpsertOneActivityMutation: RecordUpdateHook = () => {
    const upsertActivityMutation = async ({
      variables,
    }: RecordUpdateHookParams) => {
      if (isDefined(activityFromStore)) {
        await upsertActivity({
          activity: activityFromStore as Activity,
          input: variables.updateOneRecordInput,
        });
      }
    };

    return [upsertActivityMutation, { loading: false }];
  };

  const { FieldContextProvider: DueAtFieldContextProvider } = useFieldContext({
    objectNameSingular: CoreObjectNameSingular.Activity,
    objectRecordId: activityId,
    fieldMetadataName: 'dueAt',
    fieldPosition: 0,
    clearable: true,
    customUseUpdateOneObjectHook: useUpsertOneActivityMutation,
  });

  const { FieldContextProvider: AssigneeFieldContextProvider } =
    useFieldContext({
      objectNameSingular: CoreObjectNameSingular.Activity,
      objectRecordId: activityId,
      fieldMetadataName: 'assignee',
      fieldPosition: 1,
      clearable: true,
      customUseUpdateOneObjectHook: useUpsertOneActivityMutation,
    });

  const { FieldContextProvider: ActivityTargetsContextProvider } =
    useFieldContext({
      objectNameSingular: CoreObjectNameSingular.Activity,
      objectRecordId: activityId,
      fieldMetadataName: 'activityTargets',
      fieldPosition: 2,
    });

  return (
    <StyledPropertyBox>
      {activity.type === 'Task' &&
        DueAtFieldContextProvider &&
        AssigneeFieldContextProvider && (
          <>
            <DueAtFieldContextProvider>
              <RecordInlineCell />
            </DueAtFieldContextProvider>
            <AssigneeFieldContextProvider>
              <RecordInlineCell />
            </AssigneeFieldContextProvider>
          </>
        )}
      {ActivityTargetsContextProvider &&
        isDefined(activityFromCacheWithoutConnection) && (
          <ActivityTargetsContextProvider>
            <ActivityTargetsInlineCell
              activity={activityFromCacheWithoutConnection}
            />
          </ActivityTargetsContextProvider>
        )}
    </StyledPropertyBox>
  );
};
