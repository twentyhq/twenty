import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { RecordFieldsComponentInstanceContext } from '@/object-record/record-field/states/context/RecordFieldsComponentInstanceContext';
import { getRecordIndexIdFromObjectNamePluralAndViewId } from '@/object-record/utils/getRecordIndexIdFromObjectNamePluralAndViewId';
import { RecordTableFieldsDropdownHiddenFieldsContent } from '@/side-panel/pages/page-layout/components/record-table-settings/RecordTableFieldsDropdownHiddenFieldsContent';
import { RecordTableFieldsDropdownVisibleFieldsContent } from '@/side-panel/pages/page-layout/components/record-table-settings/RecordTableFieldsDropdownVisibleFieldsContent';
import { useState } from 'react';

type RecordTableFieldsDropdownContentProps = {
  viewId: string;
  objectMetadataId: string;
  onFieldUpdated?: (
    viewFieldId: string,
    update: Partial<{ position: number; isVisible: boolean }>,
  ) => void;
  onFieldCreated?: (recordField: RecordField) => void;
};

export const RecordTableFieldsDropdownContent = ({
  viewId,
  objectMetadataId,
  onFieldUpdated,
  onFieldCreated,
}: RecordTableFieldsDropdownContentProps) => {
  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: objectMetadataId,
  });

  const recordIndexId = getRecordIndexIdFromObjectNamePluralAndViewId(
    objectMetadataItem.namePlural,
    viewId,
  );

  const [showHiddenFields, setShowHiddenFields] = useState(false);

  return (
    <RecordFieldsComponentInstanceContext.Provider
      value={{ instanceId: recordIndexId }}
    >
      {showHiddenFields ? (
        <RecordTableFieldsDropdownHiddenFieldsContent
          objectMetadataId={objectMetadataId}
          recordIndexId={recordIndexId}
          onBack={() => setShowHiddenFields(false)}
          onFieldUpdated={onFieldUpdated}
          onFieldCreated={onFieldCreated}
        />
      ) : (
        <RecordTableFieldsDropdownVisibleFieldsContent
          objectMetadataId={objectMetadataId}
          recordIndexId={recordIndexId}
          onShowHiddenFields={() => setShowHiddenFields(true)}
          onFieldUpdated={onFieldUpdated}
        />
      )}
    </RecordFieldsComponentInstanceContext.Provider>
  );
};
