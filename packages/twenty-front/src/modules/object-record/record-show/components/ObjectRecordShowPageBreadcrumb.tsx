import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { InlineCellHotkeyScope } from '@/object-record/record-inline-cell/types/InlineCellHotkeyScope';
import { useRecordShowContainerActions } from '@/object-record/record-show/hooks/useRecordShowContainerActions';
import { RecordTitleCell } from '@/object-record/record-title-cell/components/RecordTitleCell';
import styled from '@emotion/styled';
import { FieldMetadataType, capitalize } from 'twenty-shared';

const StyledEditableTitleContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  overflow-x: hidden;
  width: 100%;
`;

const StyledEditableTitlePrefix = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(0.75)};
`;

const StyledTitle = styled.div`
  max-width: 100%;
  overflow: hidden;
  padding-right: ${({ theme }) => theme.spacing(1)};
  width: fit-content;
`;

export const ObjectRecordShowPageBreadcrumb = ({
  objectNameSingular,
  objectRecordId,
  objectLabelPlural,
  labelIdentifierFieldMetadataItem,
}: {
  objectNameSingular: string;
  objectRecordId: string;
  objectLabelPlural: string;
  labelIdentifierFieldMetadataItem?: FieldMetadataItem;
}) => {
  const { record, loading } = useFindOneRecord({
    objectNameSingular,
    objectRecordId,
    recordGqlFields: {
      [labelIdentifierFieldMetadataItem?.name ?? 'name']: true,
    },
  });

  const { useUpdateOneObjectRecordMutation } = useRecordShowContainerActions({
    objectNameSingular,
    objectRecordId,
    recordFromStore: record ?? null,
  });

  if (loading) {
    return null;
  }

  return (
    <StyledEditableTitleContainer>
      <StyledEditableTitlePrefix>
        {capitalize(objectLabelPlural)}
        <span>{' / '}</span>
      </StyledEditableTitlePrefix>
      <StyledTitle>
        <FieldContext.Provider
          value={{
            recordId: objectRecordId,
            recoilScopeId:
              objectRecordId + labelIdentifierFieldMetadataItem?.id,
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
            hotkeyScope: InlineCellHotkeyScope.InlineCell,
            isCentered: false,
            isDisplayModeFixHeight: true,
          }}
        >
          <RecordTitleCell sizeVariant="sm" />
        </FieldContext.Provider>
      </StyledTitle>
    </StyledEditableTitleContainer>
  );
};
