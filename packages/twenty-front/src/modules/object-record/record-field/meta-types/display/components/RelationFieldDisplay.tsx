import { EntityChip } from 'twenty-ui';

import { useRelationFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useRelationFieldDisplay';
import { getImageAbsoluteURIOrBase64 } from '~/utils/image/getImageAbsoluteURIOrBase64';
import { isDefined } from '~/utils/isDefined';

export const RelationFieldDisplay = () => {
  const { fieldValue, fieldDefinition, generateRecordChipData } =
    useRelationFieldDisplay();

  if (
    !fieldValue ||
    !fieldDefinition?.metadata.relationObjectMetadataNameSingular
  ) {
    return null;
  }

  if (!isDefined(generateRecordChipData)) {
    throw new Error(
      `generateRecordChipData is not defined for field ${fieldDefinition.metadata.fieldName}, this should not happen. Check your RecordTableContext to see if it's correctly initialized.`,
    );
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
