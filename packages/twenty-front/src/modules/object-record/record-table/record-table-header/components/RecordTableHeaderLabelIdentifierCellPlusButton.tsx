import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { isObjectMetadataReadOnly } from '@/object-record/read-only/utils/isObjectMetadataReadOnly';
import { hasAnySoftDeleteFilterOnViewComponentSelector } from '@/object-record/record-filter/states/hasAnySoftDeleteFilterOnView';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useCreateNewIndexRecord } from '@/object-record/record-table/hooks/useCreateNewIndexRecord';
import { isRecordTableCreateDisabled } from '@/object-record/record-table/utils/isRecordTableCreateDisabled';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { IconPlus } from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { LightIconButton } from 'twenty-ui/input';
import { useIsMobile } from 'twenty-ui/utilities';

const StyledHeaderIcon = styled.div`
  margin: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[1]}
    ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing['1.5']};
`;

export const RecordTableHeaderLabelIdentifierCellPlusButton = () => {
  const { objectMetadataItem, objectPermissions } =
    useRecordTableContextOrThrow();

  const isMobile = useIsMobile();
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

  const isReadOnly =
    isLayoutCustomizationModeEnabled ||
    isObjectMetadataReadOnly({
      objectPermissions,
      objectMetadataItem,
    });

  const hasAnySoftDeleteFilterOnView = useAtomComponentSelectorValue(
    hasAnySoftDeleteFilterOnViewComponentSelector,
  );

  const hasObjectUpdatePermissions = objectPermissions.canUpdateObjectRecords;

  return (
    !isMobile &&
    !isReadOnly &&
    hasObjectUpdatePermissions &&
    !hasAnySoftDeleteFilterOnView &&
    !isRecordTableCreateDisabled(objectMetadataItem) && (
      <StyledHeaderIcon>
        <LightIconButton
          Icon={IconPlus}
          size="small"
          accent="tertiary"
          onClick={handlePlusButtonClick}
        />
      </StyledHeaderIcon>
    )
  );
};
