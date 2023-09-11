import { Button } from '@/ui/button/components/Button';
import { ButtonGroup } from '@/ui/button/components/ButtonGroup';
import { IconCheckbox, IconNotes, IconTimelineEvent } from '@/ui/icon/index';

type ActivityCreateButtonProps = {
  onNoteClick?: () => void;
  onTaskClick?: () => void;
  onActivityClick?: () => void;
};

export function ActivityCreateButton({
  onNoteClick,
  onTaskClick,
  onActivityClick,
}: ActivityCreateButtonProps) {
  return (
    <ButtonGroup variant={'secondary'}>
      <Button Icon={IconNotes} title="Note" onClick={onNoteClick} />
      <Button Icon={IconCheckbox} title="Task" onClick={onTaskClick} />
      <Button
        Icon={IconTimelineEvent}
        title="Activity"
        soon={true}
        onClick={onActivityClick}
      />
    </ButtonGroup>
  );
}
