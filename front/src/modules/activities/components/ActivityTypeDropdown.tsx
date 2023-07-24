import {
  DropdownButton,
  DropdownOptionType,
} from '@/ui/button/components/DropdownButton';
import { IconCheck, IconNotes } from '@/ui/icon';
import {
  Activity,
  ActivityType,
  useUpdateActivityMutation,
} from '~/generated/graphql';

type OwnProps = {
  activity: Pick<Activity, 'id' | 'type'>;
};

export function ActivityTypeDropdown({ activity }: OwnProps) {
  const [updateActivityMutation] = useUpdateActivityMutation();
  const options: DropdownOptionType[] = [
    { label: 'Note', key: 'note', icon: <IconNotes /> },
    { label: 'Task', key: 'task', icon: <IconCheck /> },
  ];

  function getSelectedOptionKey() {
    if (activity.type === ActivityType.Note) {
      return 'note';
    } else if (activity.type === ActivityType.Task) {
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
    updateActivityMutation({
      variables: {
        id: activity.id,
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
