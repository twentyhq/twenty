import { useContext } from 'react';
import { useRecoilState } from 'recoil';

import { useGetButtonIcon } from '@/object-record/record-field/ui/hooks/useGetButtonIcon';
import { type FieldRelationValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { FieldMetadataType } from '~/generated-metadata/graphql';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { recordFieldInputDraftValueComponentState } from '@/object-record/record-field/ui/states/recordFieldInputDraftValueComponentState';
import { assertFieldMetadata } from '@/object-record/record-field/ui/types/guards/assertFieldMetadata';
import { isFieldMorphRelation } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelation';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

export const useMorphRelationField = <
  T extends ObjectRecord | ObjectRecord[],
>() => {
  const { recordId, fieldDefinition, maxWidth } = useContext(FieldContext);
  const button = useGetButtonIcon();

  assertFieldMetadata(
    FieldMetadataType.MORPH_RELATION,
    isFieldMorphRelation,
    fieldDefinition,
  );

  const fieldName = fieldDefinition.metadata.fieldName;

  const [fieldValue, setFieldValue] = useRecoilState<FieldRelationValue<T>>(
    recordStoreFamilySelector({ recordId, fieldName }),
  );

  const draftValue = useRecoilComponentValue(
    recordFieldInputDraftValueComponentState,
  );

  const initialSearchValue = draftValue;

  return {
    fieldDefinition,
    fieldValue,
    initialSearchValue,
    setFieldValue,
    maxWidth: button && maxWidth ? maxWidth - 28 : maxWidth,
    recordId,
  };
};
