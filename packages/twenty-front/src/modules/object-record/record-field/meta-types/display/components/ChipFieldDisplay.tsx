import { EntityChip } from 'twenty-ui';

import { useChipFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useChipFieldDisplay';
import { getImageAbsoluteURIOrBase64 } from '~/utils/image/getImageAbsoluteURIOrBase64';

export const ChipFieldDisplay = () => {
  const { recordValue, generateRecordChipData } = useChipFieldDisplay();

  if (!recordValue) {
    return null;
  }

  const recordChipData = generateRecordChipData(recordValue);

  return (
    <EntityChip
      entityId={recordValue.id}
      name={recordChipData.name as any}
      avatarType={recordChipData.avatarType}
      avatarUrl={getImageAbsoluteURIOrBase64(recordChipData.avatarUrl) ?? ''}
      linkToEntity={recordChipData.linkToShowPage}
    />
  );
};
