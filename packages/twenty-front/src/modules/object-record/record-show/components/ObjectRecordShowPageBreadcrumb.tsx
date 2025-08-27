import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useIsRecordFieldReadOnly } from '@/object-record/read-only/hooks/useIsRecordFieldReadOnly';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useRecordShowContainerActions } from '@/object-record/record-show/hooks/useRecordShowContainerActions';
import { useRecordShowPage } from '@/object-record/record-show/hooks/useRecordShowPage';
import { useRecordShowPagePagination } from '@/object-record/record-show/hooks/useRecordShowPagePagination';
import { RecordTitleCell } from '@/object-record/record-title-cell/components/RecordTitleCell';
import { RecordTitleCellContainerType } from '@/object-record/record-title-cell/types/RecordTitleCellContainerType';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { FieldMetadataType } from 'twenty-shared/types';

const StyledEditableTitleContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  overflow-x: hidden;
  width: 100%;
`;

const StyledEditableTitlePrefix = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  cursor: pointer;
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledTitle = styled.div`
  max-width: 100%;
  overflow: hidden;
  width: fit-content;
`;

const StyledPaginationInformation = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

export const ObjectRecordShowPageBreadcrumb = ({
  objectNameSingular,
  objectRecordId,
  objectLabel,
  labelIdentifierFieldMetadataItem,
}: {
  objectNameSingular: string;
  objectRecordId: string;
  objectLabel: string;
  labelIdentifierFieldMetadataItem?: FieldMetadataItem;
}) => {
  const { loading } = useFindOneRecord({
    objectNameSingular,
    objectRecordId,
    recordGqlFields: {
      [labelIdentifierFieldMetadataItem?.name ?? 'name']: true,
    },
  });

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { useUpdateOneObjectRecordMutation } = useRecordShowContainerActions({
    objectNameSingular,
    objectRecordId,
  });

  const isLabelIdentifierReadOnly = useIsRecordFieldReadOnly({
    recordId: objectRecordId,
    objectMetadataId: objectMetadataItem.id,
    fieldMetadataId: labelIdentifierFieldMetadataItem?.id ?? '',
  });

  const { navigateToIndexView, rankInView, totalCount } =
    useRecordShowPagePagination(objectNameSingular, objectRecordId);

  const { headerIcon: HeaderIcon } = useRecordShowPage(
    objectNameSingular,
    objectRecordId,
  );

  const theme = useTheme();

  if (loading) {
    return null;
  }

  return (
    <StyledEditableTitleContainer>
      <StyledEditableTitlePrefix
        onClick={() => {
          navigateToIndexView();
        }}
      >
        {HeaderIcon && <HeaderIcon size={theme.icon.size.md} />}
        {objectLabel}
        <span>{' / '}</span>
      </StyledEditableTitlePrefix>
      <StyledTitle>
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
            isCentered: false,
            isDisplayModeFixHeight: true,
            isRecordFieldReadOnly: isLabelIdentifierReadOnly,
          }}
        >
          <RecordTitleCell
            sizeVariant="xs"
            containerType={RecordTitleCellContainerType.PageHeader}
          />
        </FieldContext.Provider>
      </StyledTitle>
      <StyledPaginationInformation>
        {`(${rankInView + 1}/${totalCount})`}
      </StyledPaginationInformation>
    </StyledEditableTitleContainer>
  );
};
