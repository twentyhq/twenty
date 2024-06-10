import { isArray } from '@sniptt/guards';
import { EntityChip } from 'twenty-ui';

import { useFieldFocus } from '@/object-record/record-field/hooks/useFieldFocus';
import { useRelationFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useRelationFieldDisplay';
import { isFieldRelationFromManyObjects } from '@/object-record/record-field/types/guards/isFieldRelationFromManyObjects';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { ExpandableList } from '@/ui/layout/expandable-list/components/ExpandableList';
import { getImageAbsoluteURIOrBase64 } from '~/utils/image/getImageAbsoluteURIOrBase64';

const RelationFromManyFieldDisplay = ({
  fieldValue,
}: {
  fieldValue: ObjectRecord[];
}) => {
  const { isFocused } = useFieldFocus();
  const { generateRecordChipData } = useRelationFieldDisplay();

  const recordChipsData = fieldValue.map((fieldValueItem) =>
    generateRecordChipData(fieldValueItem),
  );

  return (
    <ExpandableList isChipCountDisplayed={isFocused}>
      {recordChipsData.map((record) => {
        return (
          <EntityChip
            key={record.id}
            entityId={record.id}
            name={record.name as any}
            avatarType={record.avatarType}
            avatarUrl={getImageAbsoluteURIOrBase64(record.avatarUrl) || ''}
            linkToEntity={record.linkToShowPage}
          />
        );
      })}
    </ExpandableList>
  );
};

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
