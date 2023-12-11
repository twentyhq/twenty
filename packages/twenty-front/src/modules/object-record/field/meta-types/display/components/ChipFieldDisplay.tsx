import { useChipField } from '@/object-record/field/meta-types/hooks/useChipField';
import { EntityChip } from '@/ui/display/chip/components/EntityChip';

export const ChipFieldDisplay = () => {
  const {
    record,
    entityId,
    identifiersMapper,
    objectNameSingular,
    basePathToShowPage,
  } = useChipField();

  const identifiers = identifiersMapper?.(record, objectNameSingular ?? '');

  return (
    <EntityChip
      name={identifiers?.name ?? ''}
      avatarUrl={identifiers?.avatarUrl}
      avatarType={identifiers?.avatarType}
      entityId={entityId}
      linkToEntity={basePathToShowPage + entityId}
    />
  );
};
