import { useRecoilState, useSetRecoilState } from 'recoil';

import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { viewableRecordIdState } from '@/object-record/record-right-drawer/states/viewableRecordIdState';
import { viewableRecordNameSingularState } from '@/object-record/record-right-drawer/states/viewableRecordNameSingularState';
import { useRightDrawer } from '@/ui/layout/right-drawer/hooks/useRightDrawer';
import { RightDrawerHotkeyScope } from '@/ui/layout/right-drawer/types/RightDrawerHotkeyScope';
import { RightDrawerPages } from '@/ui/layout/right-drawer/types/RightDrawerPages';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { IconList } from 'twenty-ui';
import { FeatureFlagKey } from '~/generated/graphql';

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

  const isCommandMenuV2Enabled = useIsFeatureEnabled(
    FeatureFlagKey.IsCommandMenuV2Enabled,
  );

  const { openRecordInCommandMenu } = useCommandMenu();

  return (activityId: string) => {
    if (
      isRightDrawerOpen &&
      rightDrawerPage === RightDrawerPages.ViewRecord &&
      viewableRecordId === activityId
    ) {
      return;
    }

    if (isCommandMenuV2Enabled) {
      openRecordInCommandMenu({
        recordId: activityId,
        objectNameSingular,
        isNewRecord: false,
      });
    } else {
      setHotkeyScope(RightDrawerHotkeyScope.RightDrawer, { goto: false });
      setViewableRecordId(activityId);
      setViewableRecordNameSingular(objectNameSingular);
      openRightDrawer(RightDrawerPages.ViewRecord, {
        title: objectNameSingular,
        Icon: IconList,
      });
    }
  };
};
