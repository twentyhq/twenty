import { TAB_LIST_COMPONENT_ID } from '@/ui/layout/show-page/components/ShowPageSubContainer';
import { useTabList } from '@/ui/layout/tab/hooks/useTabList';
import {
  Button,
  ButtonGroup,
  IconCheckbox,
  IconNotes,
  IconPaperclip,
} from 'twenty-ui';

export const TimelineCreateButtonGroup = ({
  isInRightDrawer = false,
}: {
  isInRightDrawer?: boolean;
}) => {
  const { setActiveTabId } = useTabList(
    `${TAB_LIST_COMPONENT_ID}-${isInRightDrawer}`,
  );

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
