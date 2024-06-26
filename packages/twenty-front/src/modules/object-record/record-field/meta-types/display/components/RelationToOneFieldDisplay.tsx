import { EntityChip } from 'twenty-ui';

import { useRelationToOneFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useRelationToOneFieldDisplay';
import { getImageAbsoluteURIOrBase64 } from '~/utils/image/getImageAbsoluteURIOrBase64';

export const RelationToOneFieldDisplay = () => {
  const { fieldValue, fieldDefinition, generateRecordChipData } =
    useRelationToOneFieldDisplay();

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
