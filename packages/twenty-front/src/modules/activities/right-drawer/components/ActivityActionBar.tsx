import { useApolloClient } from '@apollo/client';
import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { useRecoilState, useRecoilValue } from 'recoil';

import { useDeleteActivityFromCache } from '@/activities/hooks/useDeleteActivityFromCache';
import { useOpenCreateActivityDrawer } from '@/activities/hooks/useOpenCreateActivityDrawer';
import { activityTargetableEntityArrayState } from '@/activities/states/activityTargetableEntityArrayState';
import { isCreatingActivityState } from '@/activities/states/isCreatingActivityState';
import { temporaryActivityForEditorState } from '@/activities/states/temporaryActivityForEditorState';
import { viewableActivityIdState } from '@/activities/states/viewableActivityIdState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { IconPlus, IconTrash } from '@/ui/display/icon';
import { IconButton } from '@/ui/input/button/components/IconButton';
import { isRightDrawerOpenState } from '@/ui/layout/right-drawer/states/isRightDrawerOpenState';
import { isDefined } from '~/utils/isDefined';

const StyledButtonContainer = styled.div`
  display: inline-flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const ActivityActionBar = () => {
  const viewableActivityId = useRecoilValue(viewableActivityIdState);
  const activityTargetableEntityArray = useRecoilValue(
    activityTargetableEntityArrayState,
  );
  const [, setIsRightDrawerOpen] = useRecoilState(isRightDrawerOpenState);
  const { deleteOneRecord: deleteOneActivity } = useDeleteOneRecord({
    objectNameSingular: CoreObjectNameSingular.Activity,
    refetchFindManyQuery: true,
  });

  const [temporaryActivityForEditor, setTemporaryActivityForEditor] =
    useRecoilState(temporaryActivityForEditorState);

  const { deleteActivityFromCache } = useDeleteActivityFromCache();

  const [isCreatingActivity] = useRecoilState(isCreatingActivityState);

  const apolloClient = useApolloClient();
  const openCreateActivity = useOpenCreateActivityDrawer();

  const deleteActivity = () => {
    if (viewableActivityId) {
      if (isCreatingActivity && isDefined(temporaryActivityForEditor)) {
        deleteActivityFromCache(temporaryActivityForEditor);
        setTemporaryActivityForEditor(null);
      } else {
        deleteOneActivity?.(viewableActivityId);
        // TODO: find a better way to do this with custom optimistic rendering for activities
        apolloClient.refetchQueries({
          include: ['FindManyActivities'],
        });
      }
    }

    setIsRightDrawerOpen(false);
  };

  const record = useRecoilValue(
    recordStoreFamilyState(viewableActivityId ?? ''),
  );

  const addActivity = () => {
    setIsRightDrawerOpen(false);
    if (record) {
      openCreateActivity({
        type: record.type,
        assigneeId: isNonEmptyString(record.assigneeId)
          ? record.assigneeId
          : undefined,
        targetableObjects: activityTargetableEntityArray,
      });
    }
  };

  return (
    <StyledButtonContainer>
      <IconButton
        Icon={IconPlus}
        onClick={addActivity}
        size="medium"
        variant="secondary"
      />
      <IconButton
        Icon={IconTrash}
        onClick={deleteActivity}
        size="medium"
        variant="secondary"
      />
    </StyledButtonContainer>
  );
};
