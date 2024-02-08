import { useRecoilState, useRecoilValue } from 'recoil';

import { useDeleteActivityFromCache } from '@/activities/hooks/useDeleteActivityFromCache';
import { isCreatingActivityState } from '@/activities/states/isCreatingActivityState';
import { temporaryActivityForEditorState } from '@/activities/states/temporaryActivityForEditorState';
import { viewableActivityIdState } from '@/activities/states/viewableActivityIdState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { IconTrash } from '@/ui/display/icon';
import { LightIconButton } from '@/ui/input/button/components/LightIconButton';
import { isRightDrawerOpenState } from '@/ui/layout/right-drawer/states/isRightDrawerOpenState';
import { isDefined } from '~/utils/isDefined';

export const ActivityActionBar = () => {
  const viewableActivityId = useRecoilValue(viewableActivityIdState);
  const [, setIsRightDrawerOpen] = useRecoilState(isRightDrawerOpenState);
  const { deleteOneRecord: deleteOneActivity } = useDeleteOneRecord({
    objectNameSingular: CoreObjectNameSingular.Activity,
    refetchFindManyQuery: true,
  });

  const [temporaryActivityForEditor, setTemporaryActivityForEditor] =
    useRecoilState(temporaryActivityForEditorState);

  const { deleteActivityFromCache } = useDeleteActivityFromCache();

  const [isCreatingActivity] = useRecoilState(isCreatingActivityState);

  const deleteActivity = () => {
    if (viewableActivityId) {
      if (isCreatingActivity && isDefined(temporaryActivityForEditor)) {
        deleteActivityFromCache(temporaryActivityForEditor);
        setTemporaryActivityForEditor(null);
      } else {
        deleteOneActivity?.(viewableActivityId);
      }
    }

    setIsRightDrawerOpen(false);
  };

  return (
    <LightIconButton
      Icon={IconTrash}
      onClick={deleteActivity}
      accent="tertiary"
      size="medium"
    />
  );
};
