import { EntityForSelect } from '@/object-record/relation-picker/types/EntityForSelect';

export type EntitiesForMultipleEntitySelect<
  CustomEntityForSelect extends EntityForSelect,
> = {
  selectedEntities: CustomEntityForSelect[];
  filteredSelectedEntities: CustomEntityForSelect[];
  entitiesToSelect: CustomEntityForSelect[];
  loading: boolean;
};
