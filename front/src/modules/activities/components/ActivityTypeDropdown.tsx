import { useTheme } from '@emotion/react';

import { Activity } from '@/activities/types/Activity';
import {
  Chip,
  ChipAccent,
  ChipSize,
  ChipVariant,
} from '@/ui/display/chip/components/Chip';
import { IconCheckbox, IconNotes } from '@/ui/display/icon';

type ActivityTypeDropdownProps = {
  activity: Pick<Activity, 'type'>;
};

export const ActivityTypeDropdown = ({
  activity,
}: ActivityTypeDropdownProps) => {
  const theme = useTheme();
  return (
    <Chip
      label={activity.type}
      leftComponent={
        activity.type === 'Note' ? (
          <IconNotes size={theme.icon.size.md} />
        ) : (
          <IconCheckbox size={theme.icon.size.md} />
        )
      }
      size={ChipSize.Large}
      accent={ChipAccent.TextSecondary}
      variant={ChipVariant.Highlighted}
    />
  );
};
