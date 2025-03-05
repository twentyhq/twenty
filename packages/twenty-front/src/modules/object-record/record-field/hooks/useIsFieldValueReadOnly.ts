import { useContext } from 'react';

import { contextStoreCurrentViewTypeComponentState } from '@/context-store/states/contextStoreCurrentViewTypeComponentState';
import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useHasObjectReadOnlyPermission } from '@/settings/roles/hooks/useHasObjectReadOnlyPermission';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useRecoilValue } from 'recoil';
import { FieldContext } from '../contexts/FieldContext';
import { isFieldValueReadOnly } from '../utils/isFieldValueReadOnly';

export const useIsFieldValueReadOnly = () => {
  const { fieldDefinition, recordId } = useContext(FieldContext);

  const { metadata, type } = fieldDefinition;

  const recordFromStore = useRecoilValue<ObjectRecord | null>(
    recordStoreFamilyState(recordId),
  );

  const isShowPage =
    useRecoilComponentValueV2(contextStoreCurrentViewTypeComponentState) ===
    ContextStoreViewType.ShowPage;

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: metadata.objectMetadataNameSingular ?? '',
  });

  const hasObjectReadOnlyPermission = useHasObjectReadOnlyPermission();

  return isFieldValueReadOnly({
    objectNameSingular: metadata.objectMetadataNameSingular,
    fieldName: metadata.fieldName,
    fieldType: type,
    isObjectRemote: objectMetadataItem.isRemote,
    isRecordDeleted: recordFromStore?.deletedAt,
    hasObjectReadOnlyPermission,
    isShowPage,
  });
};
