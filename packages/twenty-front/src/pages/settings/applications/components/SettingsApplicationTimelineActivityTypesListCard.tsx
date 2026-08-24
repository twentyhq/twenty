import { SettingsListCard } from '@/settings/components/SettingsListCard';
import { t } from '@lingui/core/macro';
import { useIcons } from 'twenty-ui/icon';
import { Toggle } from 'twenty-ui/input';
import { SettingsApplicationTimelineActivityTypeRowDropdown } from '~/pages/settings/applications/components/SettingsApplicationTimelineActivityTypeRowDropdown';
import { type SettingsApplicationTimelineActivityType } from '~/pages/settings/applications/types/settingsApplicationTimelineActivityType';

type SettingsApplicationTimelineActivityTypesListCardProps = {
  canReset: boolean;
  isLoading: boolean;
  mutatingTimelineActivityTypeIds: ReadonlySet<string>;
  timelineActivityTypes: SettingsApplicationTimelineActivityType[];
  onReset: (id: string) => void;
  onToggle: (id: string, isActive: boolean) => void;
};

export const SettingsApplicationTimelineActivityTypesListCard = ({
  canReset,
  isLoading,
  mutatingTimelineActivityTypeIds,
  timelineActivityTypes,
  onReset,
  onToggle,
}: SettingsApplicationTimelineActivityTypesListCardProps) => {
  const { getIcon } = useIcons();

  return (
    <SettingsListCard
      items={timelineActivityTypes}
      getItemLabel={(timelineActivityType) => timelineActivityType.label}
      getItemDescription={(timelineActivityType) =>
        timelineActivityType.action === null
          ? timelineActivityType.name
          : `${timelineActivityType.name} · ${timelineActivityType.action}`
      }
      isLoading={isLoading}
      rounded
      RowIconFn={(timelineActivityType) =>
        getIcon(timelineActivityType.icon, 'IconTimelineEvent')
      }
      RowRightComponent={({ item: timelineActivityType }) => {
        const isMutating = mutatingTimelineActivityTypeIds.has(
          timelineActivityType.id,
        );

        return (
          <>
            <Toggle
              aria-label={t`Active ${timelineActivityType.label}`}
              value={timelineActivityType.isActive}
              toggleSize="small"
              disabled={isMutating}
              onChange={(isActive) =>
                onToggle(timelineActivityType.id, isActive)
              }
            />
            {canReset && (
              <SettingsApplicationTimelineActivityTypeRowDropdown
                disabled={isMutating}
                timelineActivityTypeId={timelineActivityType.id}
                onReset={() => onReset(timelineActivityType.id)}
              />
            )}
          </>
        );
      }}
    />
  );
};
