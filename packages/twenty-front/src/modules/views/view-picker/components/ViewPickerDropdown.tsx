import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { StyledDropdownButtonContainer } from '@/ui/layout/dropdown/components/StyledDropdownButtonContainer';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useGetRecordIndexTotalCount } from '@/views/hooks/internal/useGetRecordIndexTotalCount';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { ViewPickerContentCreateMode } from '@/views/view-picker/components/ViewPickerContentCreateMode';
import { ViewPickerContentEditMode } from '@/views/view-picker/components/ViewPickerContentEditMode';
import { ViewPickerContentEffect } from '@/views/view-picker/components/ViewPickerContentEffect';
import { ViewPickerListContent } from '@/views/view-picker/components/ViewPickerListContent';
import { ViewPickerTabFieldContent } from '@/views/view-picker/components/ViewPickerTabFieldContent';
import { isRecordIndexTabsDisplayedComponentSelector } from '@/object-record/record-index-tab/states/selectors/isRecordIndexTabsDisplayedComponentSelector';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useUpdateViewFromCurrentState } from '@/views/view-picker/hooks/useUpdateViewFromCurrentState';
import { useViewPickerMode } from '@/views/view-picker/hooks/useViewPickerMode';
import { getViewPickerDropdownId } from '@/views/view-picker/utils/getViewPickerDropdownId';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { IconChevronDown, IconList } from 'twenty-ui/icon';
import { useIcons } from 'twenty-ui/icon/provider';
import { MOBILE_VIEWPORT, useTheme, themeCssVariables } from 'twenty-ui/theme';
import { useLingui } from '@lingui/react/macro';

const StyledIconContainer = styled.span`
  display: flex;
  flex-shrink: 0;
`;

const StyledDropdownLabelAdornments = styled.span`
  align-items: center;
  color: ${themeCssVariables.grayScale.gray8};
  display: flex;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[1]};
  margin-left: ${themeCssVariables.spacing[1]};
`;

const StyledViewName = styled.span`
  margin-left: ${themeCssVariables.spacing[1]};
  max-width: 130px;
  min-width: 0;
  overflow: hidden;
  @media (max-width: 375px) {
    max-width: 90px;
  }
  @media (min-width: 376px) and (max-width: ${MOBILE_VIEWPORT}px) {
    max-width: 110px;
  }
`;

export const ViewPickerDropdown = () => {
  const { t } = useLingui();
  const theme = useTheme();
  const { currentView } = useGetCurrentViewOnly();

  const { updateViewFromCurrentState } = useUpdateViewFromCurrentState();

  const { totalCount } = useGetRecordIndexTotalCount();

  const { formatNumber } = useNumberFormat();

  const { recordIndexId } = useRecordIndexContextOrThrow();
  const dropdownId = getViewPickerDropdownId(recordIndexId);

  const isDropdownOpen = useAtomComponentStateValue(
    isDropdownOpenComponentState,
    dropdownId,
  );

  const { viewPickerMode, setViewPickerMode } = useViewPickerMode();

  // The All tab carries the total when tabs are displayed
  const isRecordIndexTabsDisplayed = useAtomComponentSelectorValue(
    isRecordIndexTabsDisplayedComponentSelector,
  );

  const { getIcon } = useIcons();
  const CurrentViewIcon = getIcon(currentView?.icon);

  const handleClickOutside = async () => {
    if (isDropdownOpen && viewPickerMode === 'edit') {
      await updateViewFromCurrentState();
    }
    setViewPickerMode('list');
  };

  return (
    <Dropdown
      dropdownId={dropdownId}
      dropdownOffset={{ x: 0, y: 8 }}
      dropdownPlacement="bottom-start"
      onClickOutside={handleClickOutside}
      clickableComponent={
        <StyledDropdownButtonContainer isUnfolded={isDropdownOpen}>
          <StyledIconContainer>
            {isDefined(currentView) && isDefined(CurrentViewIcon) ? (
              <CurrentViewIcon size={theme.icon.size.md} />
            ) : (
              <IconList size={theme.icon.size.md} />
            )}
          </StyledIconContainer>
          <StyledViewName>
            <OverflowingTextWithTooltip text={currentView?.name ?? t`All`} />
          </StyledViewName>
          <StyledDropdownLabelAdornments>
            {isDefined(totalCount) && !isRecordIndexTabsDisplayed && (
              <>· {formatNumber(totalCount)} </>
            )}
            <IconChevronDown size={theme.icon.size.sm} />
          </StyledDropdownLabelAdornments>
        </StyledDropdownButtonContainer>
      }
      dropdownComponents={(() => {
        switch (viewPickerMode) {
          case 'list':
            return <ViewPickerListContent />;
          case 'create-empty':
          case 'create-from-current':
            return (
              <>
                <ViewPickerContentCreateMode />
                <ViewPickerContentEffect />
              </>
            );
          case 'tab-field':
            return <ViewPickerTabFieldContent />;
          case 'edit':
            return (
              <>
                <ViewPickerContentEditMode />
                <ViewPickerContentEffect />
              </>
            );
          default:
            return null;
        }
      })()}
    />
  );
};
