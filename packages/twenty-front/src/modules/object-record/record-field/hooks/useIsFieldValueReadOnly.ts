import { useContext } from 'react';

import { contextStoreCurrentViewTypeComponentState } from '@/context-store/states/contextStoreCurrentViewTypeComponentState';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useHasObjectReadOnlyPermission } from '@/settings/roles/hooks/useHasObjectReadOnlyPermission';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared';
import { FieldContext } from '../contexts/FieldContext';
import { isFieldValueReadOnly } from '../utils/isFieldValueReadOnly';

export const useIsFieldValueReadOnly = () => {
  const { fieldDefinition, recordId } = useContext(FieldContext);

  const { metadata, type } = fieldDefinition;

  const recordDeletedAt = useRecoilValue<ObjectRecord | null>(
    recordStoreFamilySelector({
      recordId,
      fieldName: 'deletedAt',
    }),
  );

  const contextStoreCurrentViewType = useRecoilComponentValueV2(
    contextStoreCurrentViewTypeComponentState,
  );

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: metadata.objectMetadataNameSingular ?? '',
  });

  const hasObjectReadOnlyPermission = useHasObjectReadOnlyPermission();

  return isFieldValueReadOnly({
    objectNameSingular: metadata.objectMetadataNameSingular,
    fieldName: metadata.fieldName,
    fieldType: type,
    isObjectRemote: objectMetadataItem.isRemote,
    isRecordDeleted: isDefined(recordDeletedAt),
    hasObjectReadOnlyPermission,
    contextStoreCurrentViewType,
  });
};
