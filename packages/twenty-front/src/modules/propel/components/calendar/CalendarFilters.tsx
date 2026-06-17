import { Chip, Group } from '@mantine/core';
import {
  ALL_NETWORKS,
  ALL_STATUSES,
  CHANNEL_META,
  STATUS_META,
} from '@/propel/lib/socialCalendarConfig';
import {
  type SocialCalendarFilters,
  type SocialNetwork,
  type SocialPostStatus,
} from '@/propel/types/socialCalendar';

// Channel + status filter chips (§4/§6). Multi-select per axis; an empty
// selection on an axis means "all" (no filter). Color toggles are instant
// (§15 — filter chips are immediate, no movement).
export const CalendarFilters = ({
  filters,
  onChange,
}: {
  filters: SocialCalendarFilters;
  onChange: (next: SocialCalendarFilters) => void;
}) => {
  const toggleNetwork = (n: SocialNetwork) => {
    const has = filters.networks.includes(n);
    onChange({
      ...filters,
      networks: has
        ? filters.networks.filter((x) => x !== n)
        : [...filters.networks, n],
    });
  };

  const toggleStatus = (s: SocialPostStatus) => {
    const has = filters.statuses.includes(s);
    onChange({
      ...filters,
      statuses: has
        ? filters.statuses.filter((x) => x !== s)
        : [...filters.statuses, s],
    });
  };

  return (
    <Group gap="lg" wrap="wrap">
      <Chip.Group multiple value={filters.networks}>
        <Group gap={6} wrap="wrap">
          {ALL_NETWORKS.map((n) => (
            <Chip
              key={n}
              value={n}
              size="xs"
              variant="outline"
              checked={filters.networks.includes(n)}
              onClick={() => toggleNetwork(n)}
              styles={{
                label: filters.networks.includes(n)
                  ? {
                      borderColor: CHANNEL_META[n].color,
                      color: CHANNEL_META[n].color,
                    }
                  : undefined,
              }}
            >
              {CHANNEL_META[n].label}
            </Chip>
          ))}
        </Group>
      </Chip.Group>

      <Chip.Group multiple value={filters.statuses}>
        <Group gap={6} wrap="wrap">
          {ALL_STATUSES.map((s) => (
            <Chip
              key={s}
              value={s}
              size="xs"
              variant="outline"
              color="red"
              checked={filters.statuses.includes(s)}
              onClick={() => toggleStatus(s)}
            >
              {STATUS_META[s].label}
            </Chip>
          ))}
        </Group>
      </Chip.Group>
    </Group>
  );
};
