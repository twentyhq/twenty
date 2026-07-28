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
import { SidePanelPageInfoLayout } from '@/side-panel/components/SidePanelPageInfoLayout';
import { SIDE_PANEL_SEARCH_RECORD_PREVIEW_MAX_COLLAPSED_FIELDS } from '@/side-panel/pages/search/constants/SidePanelSearchRecordPreviewMaxCollapsedFields';
import { SIDE_PANEL_SEARCH_RECORD_PREVIEW_WIDTH } from '@/side-panel/pages/search/constants/SidePanelSearchRecordPreviewWidth';
import { useSidePanelSearchRecordPreviewFields } from '@/side-panel/pages/search/hooks/useSidePanelSearchRecordPreviewFields';
import { useSidePanelSearchRecordPreviewRecord } from '@/side-panel/pages/search/hooks/useSidePanelSearchRecordPreviewRecord';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { styled } from '@linaria/react';
import { Trans } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useContext, useState } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { Avatar } from 'twenty-ui/data-display';
import { useIcons } from 'twenty-ui/icon';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const SKELETON_HEIGHT = SKELETON_LOADER_HEIGHT_SIZES.standard.s;
import { dateLocaleState } from '~/localization/states/dateLocaleState';
import { beautifyPastDateRelativeToNow } from '~/utils/date-utils';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

// Pinned width so the card keeps its shape across records of different objects
const StyledCard = styled.div`
  background: ${themeCssVariables.background.primary};
  border-radius: ${themeCssVariables.border.radius.md};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  width: ${SIDE_PANEL_SEARCH_RECORD_PREVIEW_WIDTH}px;
`;

const StyledHeader = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  box-sizing: border-box;
  display: flex;
  height: 40px;
  padding: 0 ${themeCssVariables.spacing[2]};
`;

const StyledTitleText = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
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

// Rows keep a fixed height so the card does not resize as values arrive
const StyledFieldRow = styled.div`
  align-items: center;
  box-sizing: border-box;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  height: 24px;
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
  label: string;
};

export const SidePanelSearchRecordPreviewCard = ({
  objectNameSingular,
  recordId,
  label,
}: SidePanelSearchRecordPreviewCardProps) => {
  const { objectMetadataItem } = useObjectMetadataItem({ objectNameSingular });
  const { getIcon } = useIcons();
  const { theme } = useContext(ThemeContext);

  const [areAllFieldsVisible, setAreAllFieldsVisible] = useState(false);

  const { visibleFields, hiddenFields } =
    useSidePanelSearchRecordPreviewFields(objectMetadataItem);

  const { isRecordLoaded } = useSidePanelSearchRecordPreviewRecord({
    objectNameSingular,
    recordId,
  });

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

  // Collapsed shows at most a handful of the view's visible columns; everything
  // past that, plus the view's hidden columns, sits behind the expander
  const collapsedFields = visibleFields.slice(
    0,
    SIDE_PANEL_SEARCH_RECORD_PREVIEW_MAX_COLLAPSED_FIELDS,
  );

  const displayedFields = areAllFieldsVisible
    ? [...visibleFields, ...hiddenFields]
    : collapsedFields;

  const remainingFieldCount =
    visibleFields.length + hiddenFields.length - collapsedFields.length;

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
          {isRecordLoaded ? (
            <RecordFieldComponentInstanceContext.Provider
              value={{ instanceId }}
            >
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
          ) : (
            <Skeleton width={120} height={SKELETON_HEIGHT} />
          )}
        </StyledFieldValue>
      </StyledFieldRow>
    );
  };

  return (
    <SkeletonTheme
      baseColor={theme.background.tertiary}
      highlightColor={theme.background.transparent.lighter}
      borderRadius={4}
    >
      <StyledCard>
        <StyledHeader>
          <SidePanelPageInfoLayout
            icon={
              <Avatar
                avatarUrl={getAbsoluteImageUrl(recordIdentifier?.avatarUrl)}
                placeholder={recordIdentifier?.name ?? label}
                placeholderColorSeed={recordId}
                size="md"
                type={recordIdentifier?.avatarType ?? 'rounded'}
              />
            }
            title={
              <StyledTitleText>
                {recordIdentifier?.name ?? label}
              </StyledTitleText>
            }
            label={
              isRecordLoaded ? (
                beautifiedCreatedAt ? (
                  <Trans>Created {beautifiedCreatedAt}</Trans>
                ) : undefined
              ) : (
                <Skeleton width={92} height={SKELETON_HEIGHT} />
              )
            }
          />
        </StyledHeader>

        <StyledFieldList>
          {displayedFields.map(renderFieldRow)}
          {!areAllFieldsVisible &&
            remainingFieldCount > 0 && (
              // Keeping focus on the search input so arrow keys still move through results
              <StyledShowMoreContainer
                onMouseDown={(event) => event.preventDefault()}
              >
                <FieldWidgetShowMoreButton
                  remainingCount={remainingFieldCount}
                  onClick={() => setAreAllFieldsVisible(true)}
                />
              </StyledShowMoreContainer>
            )}
        </StyledFieldList>
      </StyledCard>
    </SkeletonTheme>
  );
};
