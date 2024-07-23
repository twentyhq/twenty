import { useRecoilState, useSetRecoilState } from 'recoil';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { viewableRecordIdState } from '@/object-record/record-right-drawer/states/viewableRecordIdState';
import { viewableRecordNameSingularState } from '@/object-record/record-right-drawer/states/viewableRecordNameSingularState';
import { useRightDrawer } from '@/ui/layout/right-drawer/hooks/useRightDrawer';
import { RightDrawerHotkeyScope } from '@/ui/layout/right-drawer/types/RightDrawerHotkeyScope';
import { RightDrawerPages } from '@/ui/layout/right-drawer/types/RightDrawerPages';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';

export const useOpenActivityRightDrawer = ({
  objectNameSingular,
}: {
  objectNameSingular: CoreObjectNameSingular;
}) => {
  const { openRightDrawer, isRightDrawerOpen, rightDrawerPage } =
    useRightDrawer();
  const [viewableRecordId, setViewableRecordId] = useRecoilState(
    viewableRecordIdState,
  );

  const setViewableRecordNameSingular = useSetRecoilState(
    viewableRecordNameSingularState,
  );

  const setHotkeyScope = useSetHotkeyScope();

  return (activityId: string) => {
    if (
      isRightDrawerOpen &&
      rightDrawerPage === RightDrawerPages.ViewRecord &&
      viewableRecordId === activityId
    ) {
      return;
    }

    setHotkeyScope(RightDrawerHotkeyScope.RightDrawer, { goto: false });
    setViewableRecordId(activityId);
    setViewableRecordNameSingular(objectNameSingular);
    openRightDrawer(RightDrawerPages.ViewRecord);
  };
};
