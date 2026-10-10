import { ACTOR_SOURCE_FILTER_OPTIONS } from '@/object-record/object-filter-dropdown/constants/ActorSourceFilterOptions';
import { type SelectableItem } from '@/object-record/select/types/SelectableItem';
import { t } from '@lingui/core/macro';

export const getActorSourceMultiSelectOptions = (
  selectedSourceNames: string[],
): SelectableItem[] =>
  ACTOR_SOURCE_FILTER_OPTIONS.map((actorSourceFilterOption) => ({
    id: actorSourceFilterOption.id,
    name: t(actorSourceFilterOption.label),
    isSelected: selectedSourceNames.includes(actorSourceFilterOption.id),
    AvatarIcon: actorSourceFilterOption.AvatarIcon,
    isIconInverted: actorSourceFilterOption.isIconInverted,
  }));
