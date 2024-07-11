import { AvatarChip } from 'twenty-ui';

import { useHandleRecordChipClick } from '@/object-record/cache/hooks/useHandleRecordChipClick';
import { useRelationToOneFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useRelationToOneFieldDisplay';
import { getImageAbsoluteURIOrBase64 } from '~/utils/image/getImageAbsoluteURIOrBase64';

export const RelationToOneFieldDisplay = () => {
  const { fieldValue, fieldDefinition, generateRecordChipData } =
    useRelationToOneFieldDisplay();

  const { handleRecordChipClick } = useHandleRecordChipClick({
    objectNameSingular:
      fieldDefinition.metadata.relationObjectMetadataNameSingular,
    recordId: fieldValue?.id ?? '',
  });

  if (
    !fieldValue ||
    !fieldDefinition?.metadata.relationObjectMetadataNameSingular
  ) {
    return null;
  }

  const recordChipData = generateRecordChipData(fieldValue);

  return (
    <AvatarChip
      placeholderColorSeed={recordChipData.recordId}
      name={recordChipData.name as any}
      avatarType={recordChipData.avatarType}
      avatarUrl={getImageAbsoluteURIOrBase64(recordChipData.avatarUrl) || ''}
      onClick={handleRecordChipClick}
    />
  );
};
