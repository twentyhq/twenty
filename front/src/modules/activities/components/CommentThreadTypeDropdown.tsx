import {
  DropdownButton,
  DropdownOptionType,
} from '@/ui/button/components/DropdownButton';
import { IconNotes } from '@/ui/icon/index';
import {
  ActivityType,
  CommentThread,
  useUpdateCommentThreadMutation,
} from '~/generated/graphql';

type OwnProps = {
  commentThread: Pick<CommentThread, 'id' | 'type'>;
};

export function CommentThreadTypeDropdown({ commentThread }: OwnProps) {
  const [updateCommentThreadMutation] = useUpdateCommentThreadMutation();
  const options: DropdownOptionType[] = [
    { label: 'Note', key: 'note', icon: <IconNotes /> },
  ];

  function getSelectedOptionKey() {
    if (commentThread.type === ActivityType.Note) {
      return 'note';
    } else if (commentThread.type === ActivityType.Task) {
      return 'task';
    } else {
      return undefined;
    }
  }

  const convertSelectionOptionKeyToActivityType = (key: string) => {
    switch (key) {
      case 'note':
        return ActivityType.Note;
      case 'task':
        return ActivityType.Task;
      default:
        return undefined;
    }
  };

  const handleSelect = (selectedOption: DropdownOptionType) => {
    updateCommentThreadMutation({
      variables: {
        id: commentThread.id,
        type: convertSelectionOptionKeyToActivityType(selectedOption.key),
      },
    });
  };

  return (
    <DropdownButton
      options={options}
      onSelection={handleSelect}
      selectedOptionKey={getSelectedOptionKey()}
    />
  );
}
