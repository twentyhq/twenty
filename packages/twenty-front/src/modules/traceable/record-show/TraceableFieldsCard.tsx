import groupBy from 'lodash.groupby';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { useIsRecordReadOnly } from '@/object-record/record-field/hooks/useIsRecordReadOnly';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/states/contexts/RecordFieldComponentInstanceContext';
import { isFieldValueReadOnly } from '@/object-record/record-field/utils/isFieldValueReadOnly';
import { RecordInlineCell } from '@/object-record/record-inline-cell/components/RecordInlineCell';
import { PropertyBox } from '@/object-record/record-inline-cell/property-box/components/PropertyBox';
import { PropertyBoxSkeletonLoader } from '@/object-record/record-inline-cell/property-box/components/PropertyBoxSkeletonLoader';
import { useRecordShowContainerActions } from '@/object-record/record-show/hooks/useRecordShowContainerActions';
import { useRecordShowContainerData } from '@/object-record/record-show/hooks/useRecordShowContainerData';
import { RecordDetailDuplicatesSection } from '@/object-record/record-show/record-detail-section/components/RecordDetailDuplicatesSection';
import { getRecordFieldInputId } from '@/object-record/utils/getRecordFieldInputId';
import { isFieldCellSupported } from '@/object-record/utils/isFieldCellSupported';
import { FieldMetadataType } from '~/generated/graphql';

type TraceableFieldsCardProps = {
  objectNameSingular: string;
  objectRecordId: string;
};

export const TraceableFieldsCard = ({
  objectNameSingular,
  objectRecordId,
}: TraceableFieldsCardProps) => {
  const { recordLoading, labelIdentifierFieldMetadataItem, isPrefetchLoading } =
    useRecordShowContainerData({
      objectNameSingular,
      objectRecordId,
    });

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });
  const { objectMetadataItems } = useObjectMetadataItems();

  const { useUpdateOneObjectRecordMutation } = useRecordShowContainerActions({
    objectNameSingular,
    objectRecordId,
  });

  const availableFieldMetadataItems = objectMetadataItem.fields
    .filter(
      (fieldMetadataItem) =>
        isFieldCellSupported(fieldMetadataItem, objectMetadataItems) &&
        fieldMetadataItem.id !== labelIdentifierFieldMetadataItem?.id,
    )
    .sort((fieldMetadataItemA, fieldMetadataItemB) =>
      fieldMetadataItemA.name.localeCompare(fieldMetadataItemB.name),
    );

  const inlineFieldMetadataItems = availableFieldMetadataItems
    .filter(
      (fieldMetadataItem) =>
        fieldMetadataItem.name !== 'createdAt' &&
        fieldMetadataItem.name !== 'deletedAt',
    )
    .filter(
      (fieldMetadataItem) =>
        fieldMetadataItem.type !== FieldMetadataType.RICH_TEXT_V2,
    )
    .filter(
      (fieldMetadataItem) =>
        fieldMetadataItem.type !== FieldMetadataType.RELATION,
    );

  const urlFieldKey: string[] = ['websiteUrl'];
  const utmFieldsKeys: string[] = [
    'campaignName',
    'campaignSource',
    'meansOfCommunication',
    'keyword',
    'campaignContent',
  ];
  const generatedFieldsKeys: string[] = ['generatedUrl', 'url'];

  const {
    urlInlineFieldMetadataItem,
    utmInlineFieldsMetadataItems,
    generatedInlineFieldsMetadataItems,
    inlineOthersFieldMetadataItems,
  } = groupBy(inlineFieldMetadataItems, (fieldMetadataItem) => {
    if (urlFieldKey.includes(fieldMetadataItem.name))
      return 'urlInlineFieldMetadataItem';
    if (utmFieldsKeys.includes(fieldMetadataItem.name))
      return 'utmInlineFieldsMetadataItems';
    if (generatedFieldsKeys.includes(fieldMetadataItem.name))
      return 'generatedInlineFieldsMetadataItems';
    else return 'inlineOthersFieldMetadataItems';
  });

  // TODO: Add metadata title for each field category (follow figma design).
  const tranceableOrderedFieldsMetadataItems = [
    ...(urlInlineFieldMetadataItem ?? []),
    ...(utmInlineFieldsMetadataItems ?? []),
    ...(generatedInlineFieldsMetadataItems ?? []),
    ...(inlineOthersFieldMetadataItems ?? []),
  ];

  const isRecordReadOnly = useIsRecordReadOnly({
    recordId: objectRecordId,
  });

  return (
    <>
      <PropertyBox>
        {isPrefetchLoading ? (
          <PropertyBoxSkeletonLoader />
        ) : (
          <>
            {tranceableOrderedFieldsMetadataItems?.map(
              (fieldMetadataItem, index) => (
                <FieldContext.Provider
                  key={objectRecordId + fieldMetadataItem.id}
                  value={{
                    recordId: objectRecordId,
                    maxWidth: 200,
                    isLabelIdentifier: false,
                    fieldDefinition: formatFieldMetadataItemAsColumnDefinition({
                      field: fieldMetadataItem,
                      position: index,
                      objectMetadataItem,
                      showLabel: true,
                      labelWidth: 90,
                    }),
                    useUpdateRecord: useUpdateOneObjectRecordMutation,
                    isDisplayModeFixHeight: true,
                    isReadOnly: isFieldValueReadOnly({
                      objectNameSingular,
                      fieldName: fieldMetadataItem.name,
                      fieldType: fieldMetadataItem.type,
                      isRecordReadOnly,
                    }),
                  }}
                >
                  <RecordFieldComponentInstanceContext.Provider
                    value={{
                      instanceId: getRecordFieldInputId(
                        objectRecordId,
                        fieldMetadataItem.name,
                        'fields-card',
                      ),
                    }}
                  >
                    <RecordInlineCell loading={recordLoading} />
                  </RecordFieldComponentInstanceContext.Provider>
                </FieldContext.Provider>
              ),
            )}
          </>
        )}
      </PropertyBox>
      <RecordDetailDuplicatesSection
        objectRecordId={objectRecordId}
        objectNameSingular={objectNameSingular}
      />
    </>
  );
};
