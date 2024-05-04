import { useContext } from 'react';

import {
  useSetTableValueRecordField,
  useTableValueRecordField,
} from '@/object-record/record-table/scopes/TableStatusSelectorContext';
import { FieldMetadataType } from '~/generated-metadata/graphql';

import { FieldContext } from '../../contexts/FieldContext';
import { usePersistField } from '../../hooks/usePersistField';
import { FieldLinkValue } from '../../types/FieldMetadata';
import { assertFieldMetadata } from '../../types/guards/assertFieldMetadata';
import { isFieldLink } from '../../types/guards/isFieldLink';
import { isFieldLinkValue } from '../../types/guards/isFieldLinkValue';

export const useLinkField = () => {
  const { entityId, fieldDefinition, hotkeyScope } = useContext(FieldContext);

  assertFieldMetadata(FieldMetadataType.Link, isFieldLink, fieldDefinition);

  const fieldName = fieldDefinition.metadata.fieldName;

  // const [fieldValue, setFieldValue] = useRecoilState<FieldLinkValue>(
  //   recordStoreFamilySelector({
  //     recordId: entityId,
  //     fieldName: fieldName,
  //   }),
  // );

  const fieldValue = useTableValueRecordField(entityId, fieldName);
  const setTableValueRecordField = useSetTableValueRecordField();

  const setFieldValue = (newValue: string) => {
    setTableValueRecordField(entityId, fieldName, newValue);
  };

  // const { setDraftValue, getDraftValueSelector } =
  //   useRecordFieldInput<FieldLinkValue>(`${entityId}-${fieldName}`);

  // const draftValue = useRecoilValue(getDraftValueSelector());

  const setDraftValue = (...args: any[]) => {};
  const draftValue: any = null;

  const persistField = usePersistField();

  const persistLinkField = (newValue: FieldLinkValue) => {
    if (!isFieldLinkValue(newValue)) {
      return;
    }

    persistField(newValue);
  };

  return {
    fieldDefinition,
    fieldValue,
    draftValue,
    setDraftValue,
    setFieldValue,
    hotkeyScope,
    persistLinkField,
  };
};
