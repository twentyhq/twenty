import { isArray } from '@sniptt/guards';
import { EntityChip } from 'twenty-ui';

import { RelationFromManyFieldDisplay } from '@/object-record/record-field/meta-types/display/components/RelationFromManyFieldDisplay';
import { useRelationFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useRelationFieldDisplay';
import { isFieldRelationFromManyObjects } from '@/object-record/record-field/types/guards/isFieldRelationFromManyObjects';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
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

  if (isArray(fieldValue) && isFieldRelationFromManyObjects(fieldDefinition)) {
    return (
      <RelationFromManyFieldDisplay fieldValue={fieldValue as ObjectRecord[]} />
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
