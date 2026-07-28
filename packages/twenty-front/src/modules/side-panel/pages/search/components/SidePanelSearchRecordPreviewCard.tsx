import { allowRequestsToTwentyIconsState } from '@/client-config/states/allowRequestsToTwentyIcons';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { FieldDisplay } from '@/object-record/record-field/ui/components/FieldDisplay';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { recordStoreIdentifierFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreIdentifierFamilySelector';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { FieldWidgetShowMoreButton } from '@/page-layout/widgets/field/components/FieldWidgetShowMoreButton';
import { useSidePanelSearchRecordPreviewFields } from '@/side-panel/pages/search/hooks/useSidePanelSearchRecordPreviewFields';
import { useSidePanelSearchRecordPreviewRecord } from '@/side-panel/pages/search/hooks/useSidePanelSearchRecordPreviewRecord';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { Trans } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { Avatar } from 'twenty-ui/data-display';
import { useIcons } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { dateLocaleState } from '~/localization/states/dateLocaleState';
import { beautifyPastDateRelativeToNow } from '~/utils/date-utils';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

const StyledCard = styled.div`
  background: ${themeCssVariables.background.primary};
  border-radius: ${themeCssVariables.border.radius.md};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  width: 100%;
`;

const StyledHeader = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledCreatedAt = styled.div`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.sm};
  white-space: nowrap;
`;

const StyledFieldList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  max-height: 50dvh;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledFieldRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledFieldLabel = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.md};
  gap: ${themeCssVariables.spacing[2]};
  width: 104px;
`;

const StyledFieldLabelText = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledFieldIcon = styled.span`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  height: 16px;
  width: 16px;
`;

const StyledShowMoreContainer = styled.div`
  display: flex;
`;

const StyledFieldValue = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  min-width: 0;
  overflow: hidden;
`;

type SidePanelSearchRecordPreviewCardProps = {
  objectNameSingular: string;
  recordId: string;
};

export const SidePanelSearchRecordPreviewCard = ({
  objectNameSingular,
  recordId,
}: SidePanelSearchRecordPreviewCardProps) => {
  const { objectMetadataItem } = useObjectMetadataItem({ objectNameSingular });
  const { getIcon } = useIcons();

  const [areAllFieldsVisible, setAreAllFieldsVisible] = useState(false);

  const { visibleFields, hiddenFields } =
    useSidePanelSearchRecordPreviewFields(objectMetadataItem);

  useSidePanelSearchRecordPreviewRecord({ objectNameSingular, recordId });

  const allowRequestsToTwentyIcons = useAtomStateValue(
    allowRequestsToTwentyIconsState,
  );

  const recordIdentifier = useAtomFamilySelectorValue(
    recordStoreIdentifierFamilySelector,
    { recordId, allowRequestsToTwentyIcons },
  );

  const recordCreatedAt = useAtomFamilySelectorValue(
    recordStoreFamilySelector,
    { recordId, fieldName: 'createdAt' },
  ) as string | null;

  const { localeCatalog } = useAtomStateValue(dateLocaleState);

  const beautifiedCreatedAt = isNonEmptyString(recordCreatedAt)
    ? beautifyPastDateRelativeToNow(recordCreatedAt, localeCatalog)
    : '';

  const displayedFields = areAllFieldsVisible
    ? [...visibleFields, ...hiddenFields]
    : visibleFields;

  const renderFieldRow = (
    fieldMetadataItem: FieldMetadataItem,
    index: number,
  ) => {
    const fieldDefinition = formatFieldMetadataItemAsColumnDefinition({
      field: fieldMetadataItem,
      position: index,
      objectMetadataItem,
      showLabel: true,
      labelWidth: 90,
    });

    const FieldIcon = getIcon(fieldMetadataItem.icon);

    const instanceId = getRecordFieldInputInstanceId({
      recordId,
      fieldName: fieldMetadataItem.name,
      prefix: 'side-panel-search-record-preview',
    });

    return (
      <StyledFieldRow key={fieldMetadataItem.id}>
        <StyledFieldLabel>
          <StyledFieldIcon>
            <FieldIcon size={16} />
          </StyledFieldIcon>
          <StyledFieldLabelText>{fieldMetadataItem.label}</StyledFieldLabelText>
        </StyledFieldLabel>
        <StyledFieldValue>
          <RecordFieldComponentInstanceContext.Provider value={{ instanceId }}>
            <FieldContext.Provider
              value={{
                recordId,
                isLabelIdentifier: false,
                fieldDefinition,
                isDisplayModeFixHeight: true,
                isRecordFieldReadOnly: true,
                disableChipClick: true,
              }}
            >
              <FieldDisplay />
            </FieldContext.Provider>
          </RecordFieldComponentInstanceContext.Provider>
        </StyledFieldValue>
      </StyledFieldRow>
    );
  };

  return (
    <StyledCard>
      <StyledHeader>
        <Avatar
          avatarUrl={getAbsoluteImageUrl(recordIdentifier?.avatarUrl)}
          placeholder={recordIdentifier?.name ?? ''}
          placeholderColorSeed={recordId}
          size="md"
          type={recordIdentifier?.avatarType ?? 'rounded'}
        />
        <StyledTitle>{recordIdentifier?.name}</StyledTitle>
        {beautifiedCreatedAt && (
          <StyledCreatedAt>
            <Trans>Created {beautifiedCreatedAt}</Trans>
          </StyledCreatedAt>
        )}
      </StyledHeader>

      <StyledFieldList>
        {displayedFields.map(renderFieldRow)}
        {!areAllFieldsVisible &&
          hiddenFields.length > 0 && (
            // Keeping focus on the search input so arrow keys still move through results
            <StyledShowMoreContainer
              onMouseDown={(event) => event.preventDefault()}
            >
              <FieldWidgetShowMoreButton
                remainingCount={hiddenFields.length}
                onClick={() => setAreAllFieldsVisible(true)}
              />
            </StyledShowMoreContainer>
          )}
      </StyledFieldList>
    </StyledCard>
  );
};
