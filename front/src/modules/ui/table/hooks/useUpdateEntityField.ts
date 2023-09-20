// import { useContext } from 'react';

// import type { ViewFieldDefinition } from '../../../views/types/ViewFieldDefinition';
// import { EntityUpdateMutationContext } from '../contexts/EntityUpdateMutationHookContext';

// export const useUpdateEntityField = () => {
//   const updateEntity = useContext(EntityUpdateMutationContext);

//   const updateEntityField = <
//     MetadataType extends ViewFieldMetadata,
//     ValueType extends MetadataType extends ViewFieldDoubleTextMetadata
//       ? ViewFieldDoubleTextValue
//       : MetadataType extends ViewFieldTextMetadata
//       ? ViewFieldTextValue
//       : MetadataType extends ViewFieldPhoneMetadata
//       ? ViewFieldPhoneValue
//       : MetadataType extends ViewFieldURLMetadata
//       ? ViewFieldURLValue
//       : MetadataType extends ViewFieldNumberMetadata
//       ? ViewFieldNumberValue
//       : MetadataType extends ViewFieldDateMetadata
//       ? ViewFieldDateValue
//       : MetadataType extends ViewFieldChipMetadata
//       ? ViewFieldChipValue
//       : MetadataType extends ViewFieldDoubleTextChipMetadata
//       ? ViewFieldDoubleTextChipValue
//       : MetadataType extends ViewFieldRelationMetadata
//       ? ViewFieldRelationValue
//       : unknown,
//   >(
//     currentEntityId: string,
//     columnDefinition: ViewFieldDefinition<MetadataType>,
//     newFieldValue: ValueType | null,
//   ) => {
//     // TODO: improve type guards organization, maybe with a common typeguard for all view fields
//     //    taking an object of options as parameter ?
//     //
//     // The goal would be to check that the view field value not only is valid,
//     //    but also that it is validated against the corresponding view field type

//     if (
//       // Relation
//       isViewFieldRelation(columnDefinition) &&
//       isViewFieldRelationValue(newFieldValue)
//     ) {
//       updateEntity({
//         variables: {
//           where: { id: currentEntityId },
//           data: {
//             [columnDefinition.metadata.fieldName]:
//               !newFieldValue || newFieldValue.id === ''
//                 ? { disconnect: true }
//                 : { connect: { id: newFieldValue.id } },
//           },
//         },
//       });
//       return;
//     }

//     if (
//       // Chip
//       isViewFieldChip(columnDefinition) &&
//       isViewFieldChipValue(newFieldValue)
//     ) {
//       const newContent = newFieldValue;

//       updateEntity({
//         variables: {
//           where: { id: currentEntityId },
//           data: { [columnDefinition.metadata.contentFieldName]: newContent },
//         },
//       });
//       return;
//     }

//     if (
//       // Text
//       (isViewFieldText(columnDefinition) &&
//         isViewFieldTextValue(newFieldValue)) ||
//       // Phone
//       (isViewFieldPhone(columnDefinition) &&
//         isViewFieldPhoneValue(newFieldValue)) ||
//       // Email
//       (isViewFieldEmail(columnDefinition) &&
//         isViewFieldEmailValue(newFieldValue)) ||
//       // URL
//       (isViewFieldURL(columnDefinition) &&
//         isViewFieldURLValue(newFieldValue)) ||
//       // Number
//       (isViewFieldNumber(columnDefinition) &&
//         isViewFieldNumberValue(newFieldValue)) ||
//       // Boolean
//       (isViewFieldBoolean(columnDefinition) &&
//         isViewFieldBooleanValue(newFieldValue)) ||
//       // Money
//       (isViewFieldMoney(columnDefinition) &&
//         isViewFieldMoneyValue(newFieldValue)) ||
//       // Date
//       (isViewFieldDate(columnDefinition) && isViewFieldDateValue(newFieldValue))
//     ) {
//       updateEntity({
//         variables: {
//           where: { id: currentEntityId },
//           data: { [columnDefinition.metadata.fieldName]: newFieldValue },
//         },
//       });
//       return;
//     }

//     if (
//       // Double text
//       (isViewFieldDoubleText(columnDefinition) &&
//         isViewFieldDoubleTextValue(newFieldValue)) ||
//       //  Double Text Chip
//       (isViewFieldDoubleTextChip(columnDefinition) &&
//         isViewFieldDoubleTextChipValue(newFieldValue))
//     ) {
//       updateEntity({
//         variables: {
//           where: { id: currentEntityId },
//           data: {
//             [columnDefinition.metadata.firstValueFieldName]:
//               newFieldValue.firstValue,
//             [columnDefinition.metadata.secondValueFieldName]:
//               newFieldValue.secondValue,
//           },
//         },
//       });
//     }
//   };

//   return updateEntityField;
// };
