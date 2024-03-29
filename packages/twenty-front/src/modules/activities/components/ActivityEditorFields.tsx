import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { useUpsertActivity } from '@/activities/hooks/useUpsertActivity';
import { ActivityTargetsInlineCell } from '@/activities/inline-cell/components/ActivityTargetsInlineCell';
import { Activity } from '@/activities/types/Activity';
import { useObjectMetadataItemOnly } from '@/object-metadata/hooks/useObjectMetadataItemOnly';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { useFieldContext } from '@/object-record/hooks/useFieldContext';
import {
  RecordUpdateHook,
  RecordUpdateHookParams,
} from '@/object-record/record-field/contexts/FieldContext';
import { RecordInlineCell } from '@/object-record/record-inline-cell/components/RecordInlineCell';
import { PropertyBox } from '@/object-record/record-inline-cell/property-box/components/PropertyBox';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { isDefined } from '~/utils/isDefined';

const StyledPropertyBox = styled(PropertyBox)`
  padding: 0;
`;

export const ActivityEditorFields = ({
  activityId,
}: {
  activityId: string;
}) => {
  const { upsertActivity } = useUpsertActivity();

  const { objectMetadataItem } = useObjectMetadataItemOnly({
    objectNameSingular: CoreObjectNameSingular.Activity,
  });

  const getRecordFromCache = useGetRecordFromCache({
    objectMetadataItem,
  });

  const activityFromCache = getRecordFromCache<Activity>(activityId);

  const activityFromStore = useRecoilValue(recordStoreFamilyState(activityId));

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
      {ActivityTargetsContextProvider && isDefined(activityFromCache) && (
        <ActivityTargetsContextProvider>
          <ActivityTargetsInlineCell activity={activityFromCache} />
        </ActivityTargetsContextProvider>
      )}
    </StyledPropertyBox>
  );
};
