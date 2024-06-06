import { EntityChip } from 'twenty-ui';

import { useRelationFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useRelationFieldDisplay';
import { getImageAbsoluteURIOrBase64 } from '~/utils/image/getImageAbsoluteURIOrBase64';

export const RelationFieldDisplay = () => {
  const { fieldValue, fieldDefinition, generateRecordChipData } =
    useRelationFieldDisplay();

  if (
    !fieldValue ||
    !fieldDefinition?.metadata.relationObjectMetadataNameSingular
  ) {
    return null;
  }

  const recordChipData = generateRecordChipData(fieldValue);

  return (
    <EntityChip
      entityId={fieldValue.id}
      name={recordChipData.name as any}
      avatarType={recordChipData.avatarType}
      avatarUrl={getImageAbsoluteURIOrBase64(recordChipData.avatarUrl) || ''}
      linkToEntity={recordChipData.linkToShowPage}
    />
  );
};
