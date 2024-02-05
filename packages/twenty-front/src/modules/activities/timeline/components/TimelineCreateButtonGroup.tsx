import { useSetRecoilState } from 'recoil';
import { Button, ButtonGroup } from 'tsup.ui.index';

import { useOpenCreateActivityDrawerV2 } from '@/activities/hooks/useOpenCreateActivityDrawerV2';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import {
  IconCheckbox,
  IconNotes,
  IconPaperclip,
} from '@/ui/display/icon/index';
import { TAB_LIST_COMPONENT_ID } from '@/ui/layout/show-page/components/ShowPageRightContainer';
import { useTabList } from '@/ui/layout/tab/hooks/useTabList';

export const TimelineCreateButtonGroup = ({
  targetableObject,
}: {
  targetableObject: ActivityTargetableObject;
}) => {
  const { getActiveTabIdState } = useTabList(TAB_LIST_COMPONENT_ID);
  const setActiveTabId = useSetRecoilState(getActiveTabIdState());

  const openCreateActivity = useOpenCreateActivityDrawerV2();

  return (
    <ButtonGroup variant={'secondary'}>
      <Button
        Icon={IconNotes}
        title="Note"
        onClick={() =>
          openCreateActivity({
            type: 'Note',
            targetableObjects: [targetableObject],
            timelineTargetableObject: targetableObject,
          })
        }
      />
      <Button
        Icon={IconCheckbox}
        title="Task"
        onClick={() =>
          openCreateActivity({
            type: 'Task',
            targetableObjects: [targetableObject],
            timelineTargetableObject: targetableObject,
          })
        }
      />
      <Button
        Icon={IconPaperclip}
        title="File"
        onClick={() => setActiveTabId('files')}
      />
    </ButtonGroup>
  );
};
