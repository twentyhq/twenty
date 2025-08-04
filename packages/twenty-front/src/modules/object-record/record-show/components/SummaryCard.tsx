import { useGetStandardObjectIcon } from '@/object-metadata/hooks/useGetStandardObjectIcon';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { useIsRecordFieldReadOnly } from '@/object-record/record-field/hooks/read-only/useIsRecordFieldReadOnly';
import { useRecordShowContainerActions } from '@/object-record/record-show/hooks/useRecordShowContainerActions';
import { useRecordShowContainerData } from '@/object-record/record-show/hooks/useRecordShowContainerData';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { recordStoreIdentifierFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreIdentifierSelector';
import { RecordTitleCell } from '@/object-record/record-title-cell/components/RecordTitleCell';
import { RecordTitleCellContainerType } from '@/object-record/record-title-cell/types/RecordTitleCellContainerType';
import { ShowPageSummaryCard } from '@/ui/layout/show-page/components/ShowPageSummaryCard';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';

type SummaryCardProps = {
  objectNameSingular: string;
  objectRecordId: string;
  isInRightDrawer: boolean;
};

// TODO: refactor all this hierarchy of right drawer / show page record to avoid drill down
export const SummaryCard = ({
  objectNameSingular,
  objectRecordId,
  isInRightDrawer,
}: SummaryCardProps) => {
  const { recordLoading, labelIdentifierFieldMetadataItem, isPrefetchLoading } =
    useRecordShowContainerData({
      objectNameSingular,
      objectRecordId,
    });

  const recordCreatedAt = useRecoilValue<string | null>(
    recordStoreFamilySelector({
      recordId: objectRecordId,
      fieldName: 'createdAt',
    }),
  );

  const { onUploadPicture, useUpdateOneObjectRecordMutation } =
    useRecordShowContainerActions({
      objectNameSingular,
      objectRecordId,
    });

  const { Icon, IconColor } = useGetStandardObjectIcon(objectNameSingular);
  const isMobile = useIsMobile() || isInRightDrawer;

  const recordIdentifier = useRecoilValue(
    recordStoreIdentifierFamilySelector({
      objectNameSingular,
      recordId: objectRecordId,
    }),
  );

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const isTitleReadOnly = useIsRecordFieldReadOnly({
    recordId: objectRecordId,
    fieldMetadataId: labelIdentifierFieldMetadataItem?.id,
    objectMetadataId: objectMetadataItem.id,
  });

  return (
    <ShowPageSummaryCard
      isMobile={isMobile}
      id={objectRecordId}
      logoOrAvatar={recordIdentifier?.avatarUrl ?? ''}
      icon={Icon}
      iconColor={IconColor}
      avatarPlaceholder={recordIdentifier?.name ?? ''}
      date={recordCreatedAt ?? ''}
      loading={
        isPrefetchLoading || recordLoading || !isDefined(recordCreatedAt)
      }
      title={
        <FieldContext.Provider
          value={{
            recordId: objectRecordId,
            isLabelIdentifier: false,
            fieldDefinition: {
              type:
                labelIdentifierFieldMetadataItem?.type ||
                FieldMetadataType.TEXT,
              iconName: '',
              fieldMetadataId: labelIdentifierFieldMetadataItem?.id ?? '',
              label: labelIdentifierFieldMetadataItem?.label || '',
              metadata: {
                fieldName: labelIdentifierFieldMetadataItem?.name || '',
                objectMetadataNameSingular: objectNameSingular,
              },
              defaultValue: labelIdentifierFieldMetadataItem?.defaultValue,
            },
            useUpdateRecord: useUpdateOneObjectRecordMutation,
            isCentered: !isMobile,
            isDisplayModeFixHeight: true,
            isRecordFieldReadOnly: isTitleReadOnly,
          }}
        >
          <RecordTitleCell
            sizeVariant="md"
            containerType={RecordTitleCellContainerType.ShowPage}
          />
        </FieldContext.Provider>
      }
      avatarType={recordIdentifier?.avatarType ?? 'rounded'}
      onUploadPicture={
        objectNameSingular === CoreObjectNameSingular.Person
          ? onUploadPicture
          : undefined
      }
    />
  );
};
