import { useTheme } from '@emotion/react';

import {
  Chip,
  ChipAccent,
  ChipSize,
  ChipVariant,
} from '@/ui/Display/Chip/components/Chip';
import { IconCheckbox, IconNotes } from '@/ui/Display/Icon';
import { Activity, ActivityType } from '~/generated/graphql';

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
        activity.type === ActivityType.Note ? (
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
