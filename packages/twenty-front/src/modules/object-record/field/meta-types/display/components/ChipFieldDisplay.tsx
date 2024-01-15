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

  // TODO: remove this and use ObjectRecordChip instead
  const identifiers = identifiersMapper?.(record, objectNameSingular ?? '');
  console.log('identifiers', identifiers);

  const linkToEntity =
    !!basePathToShowPage && !!entityId ? basePathToShowPage + entityId : '';

  return (
    <EntityChip
      name={identifiers?.name ?? ''}
      avatarUrl={identifiers?.avatarUrl}
      avatarType={identifiers?.avatarType}
      entityId={entityId}
      linkToEntity={linkToEntity}
    />
  );
};
