import {
  IconCheckbox,
  IconNotes,
  IconTimelineEvent,
} from '@/ui/display/icon/index';
import useI18n from '@/ui/i18n/useI18n';
import { Button } from '@/ui/input/button/components/Button';
import { ButtonGroup } from '@/ui/input/button/components/ButtonGroup';

type ActivityCreateButtonProps = {
  onNoteClick?: () => void;
  onTaskClick?: () => void;
  onActivityClick?: () => void;
};

export const ActivityCreateButton = ({
  onNoteClick,
  onTaskClick,
  onActivityClick,
}: ActivityCreateButtonProps) => {
  const { translate } = useI18n('translations');
  return (
    <ButtonGroup variant={'secondary'}>
      <Button
        Icon={IconNotes}
        title={translate('note')}
        onClick={onNoteClick}
      />
      <Button
        Icon={IconCheckbox}
        title={translate('task')}
        onClick={onTaskClick}
      />
      <Button
        Icon={IconTimelineEvent}
        title={translate('activity')}
        soon={true}
        onClick={onActivityClick}
      />
    </ButtonGroup>
  );
};
