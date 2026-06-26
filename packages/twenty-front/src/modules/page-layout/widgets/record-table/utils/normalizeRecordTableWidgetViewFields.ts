type RecordTableWidgetViewFieldWithLabelIdentifierInvariant = {
  fieldMetadataId: string;
  isVisible: boolean;
  position: number;
};

type NormalizeRecordTableWidgetViewFieldsArgs<
  ViewField extends RecordTableWidgetViewFieldWithLabelIdentifierInvariant,
> = {
  viewFields: ViewField[];
  labelIdentifierFieldMetadataId: string;
};

export const normalizeRecordTableWidgetViewFields = <
  ViewField extends RecordTableWidgetViewFieldWithLabelIdentifierInvariant,
>({
  viewFields,
  labelIdentifierFieldMetadataId,
}: NormalizeRecordTableWidgetViewFieldsArgs<ViewField>): ViewField[] => {
  const labelIdentifierViewField = viewFields.find(
    (viewField) => viewField.fieldMetadataId === labelIdentifierFieldMetadataId,
  );

  if (labelIdentifierViewField === undefined) {
    return viewFields;
  }

  const normalizedLabelIdentifierViewField: ViewField = {
    ...labelIdentifierViewField,
    isVisible: true,
    position: 0,
  };

  const normalizedOtherViewFields = viewFields
    .filter(
      (viewField) =>
        viewField.fieldMetadataId !== labelIdentifierFieldMetadataId,
    )
    .toSorted((viewFieldA, viewFieldB) => {
      return viewFieldA.position - viewFieldB.position;
    })
    .map<ViewField>((viewField, index) => ({
      ...viewField,
      position: index + 1,
    }));

  return [normalizedLabelIdentifierViewField, ...normalizedOtherViewFields];
};
