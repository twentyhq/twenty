import { useTheme } from '@emotion/react';

import { Button } from '@/ui/button/components/Button';
import { ButtonGroup } from '@/ui/button/components/ButtonGroup';
import { IconCheckbox, IconNotes, IconTimelineEvent } from '@/ui/icon/index';

type CommentThreadCreateButtonProps = {
  onNoteClick?: () => void;
  onTaskClick?: () => void;
  onActivityClick?: () => void;
};

export function CommentThreadCreateButton({
  onNoteClick,
  onTaskClick,
  onActivityClick,
}: CommentThreadCreateButtonProps) {
  const theme = useTheme();
  return (
    <ButtonGroup variant="secondary">
      <Button
        icon={<IconNotes size={theme.icon.size.sm} />}
        title="Note"
        onClick={onNoteClick}
      />
      <Button
        icon={<IconCheckbox size={theme.icon.size.sm} />}
        title="Task"
        soon={true}
      />
      <Button
        icon={<IconTimelineEvent size={theme.icon.size.sm} />}
        title="Activity"
        soon={true}
        onClick={onActivityClick}
      />
    </ButtonGroup>
  );
}
