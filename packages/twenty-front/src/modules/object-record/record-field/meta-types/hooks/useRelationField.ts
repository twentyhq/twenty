import { useContext } from 'react';

import { useGetButtonIcon } from '@/object-record/record-field/hooks/useGetButtonIcon';
import {
  useSetTableValueRecordField,
  useTableValueRecordField,
} from '@/object-record/record-table/scopes/TableStatusSelectorContext';
import { FieldMetadataType } from '~/generated-metadata/graphql';

import { FieldContext } from '../../contexts/FieldContext';
import { assertFieldMetadata } from '../../types/guards/assertFieldMetadata';
import { isFieldRelation } from '../../types/guards/isFieldRelation';

// TODO: we will be able to type more precisely when we will have custom field and custom entities support
export const useRelationField = () => {
  const { entityId, fieldDefinition, maxWidth } = useContext(FieldContext);
  const button = useGetButtonIcon();

  assertFieldMetadata(
    FieldMetadataType.Relation,
    isFieldRelation,
    fieldDefinition,
  );

  const fieldName = fieldDefinition.metadata.fieldName;

  // const [fieldValue, setFieldValue] = useRecoilState<FieldRelationValue>(
  //   recordStoreFamilySelector({ recordId: entityId, fieldName }),
  // );

  const fieldValue = useTableValueRecordField(entityId, fieldName);
  const setTableValueRecordField = useSetTableValueRecordField();

  const setFieldValue = (newValue: string) => {
    setTableValueRecordField(entityId, fieldName, newValue);
  };

  // const { getDraftValueSelector } = useRecordFieldInput<FieldRelationValue>(
  //   `${entityId}-${fieldName}`,
  // );
  // const draftValue = useRecoilValue(getDraftValueSelector());

  const setDraftValue = (...args: any[]) => {};
  const draftValue: any = null;

  const initialSearchValue = draftValue;

  return {
    fieldDefinition,
    fieldValue,
    initialSearchValue,
    setFieldValue,
    maxWidth: button && maxWidth ? maxWidth - 28 : maxWidth,
    entityId,
  };
};
