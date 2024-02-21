import { useSetRecoilState } from 'recoil';
import { Button, ButtonGroup } from 'tsup.ui.index';

import { useOpenCreateActivityDrawer } from '@/activities/hooks/useOpenCreateActivityDrawer';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import {
  IconCheckbox,
  IconNotes,
  IconPaperclip,
} from '@/ui/display/icon/index';
import { TAB_LIST_COMPONENT_ID } from '@/ui/layout/show-page/components/ShowPageRightContainer';
import { useTabList } from '@/ui/layout/tab/hooks/useTabList';
import useI18n from '@/ui/i18n/useI18n';

export const TimelineCreateButtonGroup = ({
  targetableObject,
}: {
  targetableObject: ActivityTargetableObject;
}) => {
  const { getActiveTabIdState } = useTabList(TAB_LIST_COMPONENT_ID);
  const setActiveTabId = useSetRecoilState(getActiveTabIdState());
  const { translate } = useI18n('translations');
  const openCreateActivity = useOpenCreateActivityDrawer();

  return (
    <ButtonGroup variant={'secondary'}>
      <Button
        Icon={IconNotes}
        title={translate('note')}
        onClick={() =>
          openCreateActivity({
            type: 'Note',
            targetableObjects: [targetableObject],
          })
        }
      />
      <Button
        Icon={IconCheckbox}
        title={translate('task')}
        onClick={() =>
          openCreateActivity({
            type: 'Task',
            targetableObjects: [targetableObject],
          })
        }
      />
      <Button
        Icon={IconPaperclip}
        title={translate('file')}
        onClick={() => setActiveTabId('files')}
      />
    </ButtonGroup>
  );
};
