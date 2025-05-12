import styled from '@emotion/styled';
import groupBy from 'lodash.groupby';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
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
import { Traceable } from '@/traceable/types/Traceable';
import { useLingui } from '@lingui/react/macro';
import { ReactElement } from 'react';
import { FieldMetadataType } from '~/generated/graphql';
import {
  TraceableFieldSection,
  getTraceableFieldSectionLabel,
} from '../types/FieldsSection';

type TraceableFieldsCardProps = {
  objectNameSingular: string;
  objectRecordId: string;
};

const StyledFieldsSectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledUtmFieldsGreyBox = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  border: ${({ theme }) => `1px solid ${theme.border.color.medium}`};
  border-radius: ${({ theme }) => theme.border.radius.md};
  height: 'auto';

  padding: ${({ theme }) => theme.spacing(2)};

  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledTraceableLinksFieldsBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  font-size: ${({ theme }) => theme.font.size.xs};
`;

export const TraceableFieldsCard = ({
  objectNameSingular,
  objectRecordId,
}: TraceableFieldsCardProps) => {
  const { recordLoading, labelIdentifierFieldMetadataItem, isPrefetchLoading } =
    useRecordShowContainerData({
      objectNameSingular,
      objectRecordId,
    });

  const { t } = useLingui();

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
        !['createdAt', 'deletedAt', 'updatedAt'].includes(
          fieldMetadataItem.name,
        ),
    )
    .filter(
      (fieldMetadataItem) =>
        fieldMetadataItem.type !== FieldMetadataType.RICH_TEXT_V2,
    )
    .filter(
      (fieldMetadataItem) =>
        fieldMetadataItem.type !== FieldMetadataType.RELATION,
    );

  const isRecordReadOnly = useIsRecordReadOnly({
    recordId: objectRecordId,
  });

  const urlFieldKey: (keyof Traceable)[] = ['websiteUrl'];
  const utmFieldsKeys: (keyof Traceable)[] = [
    'campaignName',
    'campaignSource',
    'meansOfCommunication',
    'keyword',
    'campaignContent',
  ];
  const generatedFieldsKeys: (keyof Traceable)[] = ['generatedUrl', 'url'];

  const {
    urlInlineFieldMetadataItem,
    utmInlineFieldsMetadataItems,
    generatedInlineFieldsMetadataItems,
    inlineOthersFieldMetadataItems,
  } = groupBy(inlineFieldMetadataItems, (fieldMetadataItem) => {
    if (urlFieldKey.includes(fieldMetadataItem.name as keyof Traceable))
      return 'urlInlineFieldMetadataItem';
    if (utmFieldsKeys.includes(fieldMetadataItem.name as keyof Traceable))
      return 'utmInlineFieldsMetadataItems';
    if (generatedFieldsKeys.includes(fieldMetadataItem.name as keyof Traceable))
      return 'generatedInlineFieldsMetadataItems';
    else return 'inlineOthersFieldMetadataItems';
  });

  const fieldsMetadataMapper = (fieldsMetadata: FieldMetadataItem[]) =>
    fieldsMetadata.map((fieldMetadataItem, index) => (
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
    ));

  const TRACEABLE_FIELDS_METADATA_SECTIONS_RECORD: Record<
    string,
    ReactElement | ReactElement[]
  > = {
    [getTraceableFieldSectionLabel(TraceableFieldSection.Sumary)]: (
      <>{fieldsMetadataMapper(urlInlineFieldMetadataItem)}</>
    ),
    [getTraceableFieldSectionLabel(TraceableFieldSection.UTM)]: (
      <StyledUtmFieldsGreyBox>
        {fieldsMetadataMapper(utmInlineFieldsMetadataItems)}
      </StyledUtmFieldsGreyBox>
    ),
    [getTraceableFieldSectionLabel(TraceableFieldSection.TraceableLinks)]: (
      <StyledTraceableLinksFieldsBox>
        {t`Use the 'Traceable URL' link in any promotinal channels you want to be associated with this custom campaign.`}
        {fieldsMetadataMapper(generatedInlineFieldsMetadataItems)}
      </StyledTraceableLinksFieldsBox>
    ),
    [getTraceableFieldSectionLabel(TraceableFieldSection.Others)]: (
      <>{fieldsMetadataMapper(inlineOthersFieldMetadataItems ?? [])}</>
    ),
  };

  return (
    <>
      <PropertyBox>
        {isPrefetchLoading ? (
          <PropertyBoxSkeletonLoader />
        ) : (
          <>
            {Object.entries(TRACEABLE_FIELDS_METADATA_SECTIONS_RECORD).map(
              ([label, fields]) => (
                <StyledFieldsSectionContainer>
                  {!label.startsWith('no-label') && <>{label}</>}
                  {fields}
                </StyledFieldsSectionContainer>
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
