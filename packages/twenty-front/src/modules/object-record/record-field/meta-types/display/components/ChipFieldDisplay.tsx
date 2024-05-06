import { EntityChip } from 'twenty-ui';

import { useChipField } from '@/object-record/record-field/meta-types/hooks/useChipField';
import { getImageAbsoluteURIOrBase64 } from '~/utils/image/getImageAbsoluteURIOrBase64';

export const ChipFieldDisplay = () => {
  const { record, generateRecordChipData } = useChipField();

  if (!record || !generateRecordChipData) return null;

  const chipData = generateRecordChipData(record);

  return (
    <EntityChip
      entityId={record.id}
      name={chipData.name as any}
      avatarType={chipData.avatarType}
      avatarUrl={getImageAbsoluteURIOrBase64(chipData.avatarUrl) || ''}
      linkToEntity={chipData.linkToShowPage}
    />
  );
};
