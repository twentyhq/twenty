import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { hasAnySoftDeleteFilterOnViewComponentSelector } from '@/object-record/record-filter/states/hasAnySoftDeleteFilterOnView';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useCreateNewIndexRecord } from '@/object-record/record-table/hooks/useCreateNewIndexRecord';
import { isRecordTableCellsNonEditableComponentState } from '@/object-record/record-table/states/isRecordTableCellsNonEditableComponentState';
import { RecordTableWidgetContext } from '@/object-record/record-table-widget/contexts/RecordTableWidgetContext';
import { canCreateRecordsForObjectMetadataItem } from '@/object-record/utils/canCreateRecordsForObjectMetadataItem';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconPlus } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';
import { useIsMobile } from 'twenty-ui/utilities';

const StyledHeaderIcon = styled.div`
  margin: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[1]}
    ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing['1.5']};
`;

export const RecordTableHeaderLabelIdentifierCellPlusButton = () => {
  const { objectMetadataItem, objectPermissions } =
    useRecordTableContextOrThrow();

  const isMobile = useIsMobile();
  const recordTableWidgetContext = useContext(RecordTableWidgetContext);
  const isRecordTableCellsNonEditable = useAtomComponentStateValue(
    isRecordTableCellsNonEditableComponentState,
  );
  const isCreateThroughRelationWidget =
    isDefined(recordTableWidgetContext?.nestedRelationCreateThrough) ||
    isDefined(recordTableWidgetContext?.junctionCreateThrough);
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );

  const { createNewIndexRecord } = useCreateNewIndexRecord({
    objectMetadataItem,
  });

  const handlePlusButtonClick = () => {
    createNewIndexRecord({
      position: 'first',
    });
  };

  const hasAnySoftDeleteFilterOnView = useAtomComponentSelectorValue(
    hasAnySoftDeleteFilterOnViewComponentSelector,
  );

  return (
    !isMobile &&
    !isRecordTableCellsNonEditable &&
    !isCreateThroughRelationWidget &&
    !isLayoutCustomizationModeEnabled &&
    !hasAnySoftDeleteFilterOnView &&
    canCreateRecordsForObjectMetadataItem({
      objectPermissions,
      objectMetadataItem,
    }) && (
      <StyledHeaderIcon>
        <LightIconButton
          size="sm"
          emphasis="subtle"
          onClick={handlePlusButtonClick}
          aria-label={t`Create record`}
        >
          <IconPlus />
        </LightIconButton>
      </StyledHeaderIcon>
    )
  );
};
