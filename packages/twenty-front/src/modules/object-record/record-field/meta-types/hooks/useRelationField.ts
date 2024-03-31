import { useContext } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { useGetButtonIcon } from '@/object-record/record-field/hooks/useGetButtonIcon';
import { useRecordFieldInput } from '@/object-record/record-field/hooks/useRecordFieldInput';
import { FieldRelationValue } from '@/object-record/record-field/types/FieldMetadata';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
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

  const [fieldValue, setFieldValue] = useRecoilState<FieldRelationValue>(
    recordStoreFamilySelector({ recordId: entityId, fieldName }),
  );

  const { getDraftValueSelector } = useRecordFieldInput<FieldRelationValue>(
    `${entityId}-${fieldName}`,
  );
  const draftValue = useRecoilValue(getDraftValueSelector());

  const initialSearchValue = draftValue;

  return {
    fieldDefinition,
    fieldValue,
    initialSearchValue,
    setFieldValue,
    maxWidth: button && maxWidth ? maxWidth - 28 : maxWidth,
  };
};
