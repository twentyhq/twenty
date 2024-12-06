import { useGetStandardObjectIcon } from '@/object-metadata/hooks/useGetStandardObjectIcon';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { isFieldValueReadOnly } from '@/object-record/record-field/utils/isFieldValueReadOnly';
import { RecordInlineCell } from '@/object-record/record-inline-cell/components/RecordInlineCell';
import { InlineCellHotkeyScope } from '@/object-record/record-inline-cell/types/InlineCellHotkeyScope';
import { RightDrawerTitleRecordInlineCell } from '@/object-record/record-right-drawer/components/RightDrawerTitleRecordInlineCell';
import { useRecordShowContainerActions } from '@/object-record/record-show/hooks/useRecordShowContainerActions';
import { useRecordShowContainerData } from '@/object-record/record-show/hooks/useRecordShowContainerData';
import { ShowPageSummaryCard } from '@/ui/layout/show-page/components/ShowPageSummaryCard';
import { ShowPageSummaryCardSkeletonLoader } from '@/ui/layout/show-page/components/ShowPageSummaryCardSkeletonLoader';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { FieldMetadataType } from '~/generated/graphql';
import { isDefined } from '~/utils/isDefined';

type SummaryCardProps = {
  objectNameSingular: string;
  objectRecordId: string;
  isNewRightDrawerItemLoading: boolean;
  isInRightDrawer: boolean;
};

// TODO: refactor all this hierarchy of right drawer / show page record to avoid drill down
export const SummaryCard = ({
  objectNameSingular,
  objectRecordId,
  isNewRightDrawerItemLoading,
  isInRightDrawer,
}: SummaryCardProps) => {
  const {
    recordFromStore,
    recordLoading,
    labelIdentifierFieldMetadataItem,
    isPrefetchLoading,
    recordIdentifier,
  } = useRecordShowContainerData({
    objectNameSingular,
    objectRecordId,
  });

  const { onUploadPicture, useUpdateOneObjectRecordMutation } =
    useRecordShowContainerActions({
      objectNameSingular,
      objectRecordId,
      recordFromStore,
    });

  const { Icon, IconColor } = useGetStandardObjectIcon(objectNameSingular);
  const isMobile = useIsMobile() || isInRightDrawer;

  const isReadOnly = isFieldValueReadOnly({
    objectNameSingular,
    isRecordDeleted: recordFromStore?.isDeleted,
  });

  if (isNewRightDrawerItemLoading || !isDefined(recordFromStore)) {
    return <ShowPageSummaryCardSkeletonLoader />;
  }

  return (
    <ShowPageSummaryCard
      isMobile={isMobile}
      id={objectRecordId}
      logoOrAvatar={recordIdentifier?.avatarUrl ?? ''}
      icon={Icon}
      iconColor={IconColor}
      avatarPlaceholder={recordIdentifier?.name ?? ''}
      date={recordFromStore.createdAt ?? ''}
      loading={isPrefetchLoading || recordLoading}
      title={
        <FieldContext.Provider
          value={{
            recordId: objectRecordId,
            recoilScopeId:
              objectRecordId + labelIdentifierFieldMetadataItem?.id,
            isLabelIdentifier: false,
            fieldDefinition: {
              type:
                labelIdentifierFieldMetadataItem?.type ||
                FieldMetadataType.Text,
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
            hotkeyScope: InlineCellHotkeyScope.InlineCell,
            isCentered: !isMobile,
            isDisplayModeFixHeight: true,
          }}
        >
          {isInRightDrawer ? (
            <RightDrawerTitleRecordInlineCell />
          ) : (
            <RecordInlineCell readonly={isReadOnly} />
          )}
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
