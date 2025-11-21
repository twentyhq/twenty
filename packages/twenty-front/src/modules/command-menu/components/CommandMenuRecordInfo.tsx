import { viewableRecordIdComponentState } from '@/command-menu/pages/record-page/states/viewableRecordIdComponentState';
import { viewableRecordNameSingularComponentState } from '@/command-menu/pages/record-page/states/viewableRecordNameSingularComponentState';
import { useLabelIdentifierFieldMetadataItem } from '@/object-metadata/hooks/useLabelIdentifierFieldMetadataItem';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useIsRecordFieldReadOnly } from '@/object-record/read-only/hooks/useIsRecordFieldReadOnly';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useRecordShowContainerActions } from '@/object-record/record-show/hooks/useRecordShowContainerActions';
import { useRecordShowPage } from '@/object-record/record-show/hooks/useRecordShowPage';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { recordStoreIdentifierFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreIdentifierSelector';
import { RecordTitleCell } from '@/object-record/record-title-cell/components/RecordTitleCell';
import { RecordTitleCellContainerType } from '@/object-record/record-title-cell/types/RecordTitleCellContainerType';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import styled from '@emotion/styled';
import { Trans } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useRecoilValue } from 'recoil';
import { Avatar } from 'twenty-ui/display';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { dateLocaleState } from '~/localization/states/dateLocaleState';
import { beautifyPastDateRelativeToNow } from '~/utils/date-utils';

const StyledRecordInfoContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(0.5)};
`;

const StyledRecordAvatar = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.transparent.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(1)};
`;

const StyledRecordTitleContainer = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  min-width: 0;
`;

const StyledRecordDate = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
  white-space: nowrap;
`;

export const CommandMenuRecordInfo = ({
  commandMenuPageInstanceId,
}: {
  commandMenuPageInstanceId: string;
}) => {
  const viewableRecordNameSingular = useRecoilComponentValue(
    viewableRecordNameSingularComponentState,
    commandMenuPageInstanceId,
  );

  const viewableRecordId = useRecoilComponentValue(
    viewableRecordIdComponentState,
    commandMenuPageInstanceId,
  );

  const { objectNameSingular, objectRecordId } = useRecordShowPage(
    viewableRecordNameSingular!,
    viewableRecordId!,
  );

  const recordCreatedAt = useRecoilValue<string | null>(
    recordStoreFamilySelector({
      recordId: objectRecordId,
      fieldName: 'createdAt',
    }),
  );

  const recordIdentifier = useRecoilValue(
    recordStoreIdentifierFamilySelector({
      recordId: objectRecordId,
    }),
  );

  const { localeCatalog } = useRecoilValue(dateLocaleState);
  const beautifiedCreatedAt = isNonEmptyString(recordCreatedAt)
    ? beautifyPastDateRelativeToNow(recordCreatedAt, localeCatalog)
    : '';

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { labelIdentifierFieldMetadataItem } =
    useLabelIdentifierFieldMetadataItem({
      objectNameSingular,
    });

  const isTitleReadOnly = useIsRecordFieldReadOnly({
    recordId: objectRecordId,
    fieldMetadataId: labelIdentifierFieldMetadataItem?.id ?? '',
    objectMetadataId: objectMetadataItem.id,
  });

  const { useUpdateOneObjectRecordMutation } = useRecordShowContainerActions({
    objectNameSingular,
    objectRecordId,
  });

  const fieldDefinition = {
    type: labelIdentifierFieldMetadataItem?.type ?? FieldMetadataType.TEXT,
    iconName: '',
    fieldMetadataId: labelIdentifierFieldMetadataItem?.id ?? '',
    label: labelIdentifierFieldMetadataItem?.label ?? '',
    metadata: {
      fieldName: labelIdentifierFieldMetadataItem?.name ?? '',
      objectMetadataNameSingular: objectNameSingular,
    },
    defaultValue: labelIdentifierFieldMetadataItem?.defaultValue,
  };

  return (
    <StyledRecordInfoContainer>
      {recordIdentifier && (
        <StyledRecordAvatar>
          <Avatar
            avatarUrl={recordIdentifier.avatarUrl}
            placeholder={recordIdentifier.name}
            placeholderColorSeed={objectRecordId}
            size="md"
            type={recordIdentifier.avatarType}
          />
        </StyledRecordAvatar>
      )}
      <StyledRecordTitleContainer>
        <FieldContext.Provider
          value={{
            recordId: objectRecordId,
            isLabelIdentifier: false,
            fieldDefinition,
            useUpdateRecord: useUpdateOneObjectRecordMutation,
            isCentered: false,
            isDisplayModeFixHeight: true,
            isRecordFieldReadOnly: isTitleReadOnly,
          }}
        >
          <RecordTitleCell
            sizeVariant="sm"
            containerType={RecordTitleCellContainerType.PageHeader}
          />
        </FieldContext.Provider>
      </StyledRecordTitleContainer>
      {beautifiedCreatedAt && (
        <StyledRecordDate>
          <Trans>Created {beautifiedCreatedAt}</Trans>
        </StyledRecordDate>
      )}
    </StyledRecordInfoContainer>
  );
};
