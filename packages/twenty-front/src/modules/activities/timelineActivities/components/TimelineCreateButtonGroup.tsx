import { useSetRecoilState } from 'recoil';
import { IconCheckbox, IconNotes, IconPaperclip } from 'twenty-ui';

import { Button } from '@/ui/input/button/components/Button';
import { ButtonGroup } from '@/ui/input/button/components/ButtonGroup';
import { TAB_LIST_COMPONENT_ID } from '@/ui/layout/show-page/components/ShowPageRightContainer';
import { useTabList } from '@/ui/layout/tab/hooks/useTabList';

export const TimelineCreateButtonGroup = ({
  isInRightDrawer = false,
}: {
  isInRightDrawer?: boolean;
}) => {
  const { activeTabIdState } = useTabList(
    `${TAB_LIST_COMPONENT_ID}-${isInRightDrawer}`,
  );
  const setActiveTabId = useSetRecoilState(activeTabIdState);

  return (
    <ButtonGroup variant={'secondary'}>
      <Button
        Icon={IconNotes}
        title="Note"
        onClick={() => {
          setActiveTabId('notes');
        }}
      />
      <Button
        Icon={IconCheckbox}
        title="Task"
        onClick={() => {
          setActiveTabId('tasks');
        }}
      />
      <Button
        Icon={IconPaperclip}
        title="File"
        onClick={() => setActiveTabId('files')}
      />
    </ButtonGroup>
  );
};
