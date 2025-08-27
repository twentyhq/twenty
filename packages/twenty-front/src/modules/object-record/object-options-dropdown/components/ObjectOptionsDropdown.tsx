import { useDropdownContextCurrentContentId } from '@/dropdown-context-state-management/hooks/useDropdownContextCurrentContentId';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { ObjectOptionsDropdownContent } from '@/object-record/object-options-dropdown/components/ObjectOptionsDropdownContent';
import { OBJECT_OPTIONS_DROPDOWN_ID } from '@/object-record/object-options-dropdown/constants/ObjectOptionsDropdownId';
import { ObjectOptionsDropdownContext } from '@/object-record/object-options-dropdown/states/contexts/ObjectOptionsDropdownContext';
import { type ObjectOptionsContentId } from '@/object-record/object-options-dropdown/types/ObjectOptionsContentId';
import { RecordGroupReorderConfirmationModal } from '@/object-record/record-group/components/RecordGroupReorderConfirmationModal';
import { useRecordGroupReorderConfirmationModal } from '@/object-record/record-group/hooks/useRecordGroupReorderConfirmationModal';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { StyledHeaderDropdownButton } from '@/ui/layout/dropdown/components/StyledHeaderDropdownButton';
import { DROPDOWN_OFFSET_Y } from '@/ui/layout/dropdown/constants/DropdownOffsetY';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { type ViewType } from '@/views/types/ViewType';
import { Trans } from '@lingui/react/macro';

type ObjectOptionsDropdownProps = {
  viewType: ViewType;
  objectMetadataItem: ObjectMetadataItem;
  recordIndexId: string;
};

export const ObjectOptionsDropdown = ({
  recordIndexId,
  objectMetadataItem,
  viewType,
}: ObjectOptionsDropdownProps) => {
  const { currentContentId, handleContentChange, handleResetContent } =
    useDropdownContextCurrentContentId<ObjectOptionsContentId>();

  const isDropdownOpen = useRecoilComponentValue(
    isDropdownOpenComponentState,
    OBJECT_OPTIONS_DROPDOWN_ID,
  );

  const {
    handleRecordGroupOrderChangeWithModal,
    handleRecordGroupReorderConfirmClick,
  } = useRecordGroupReorderConfirmationModal({
    recordIndexId,
    viewType,
  });
  return (
    <>
      <Dropdown
        dropdownId={OBJECT_OPTIONS_DROPDOWN_ID}
        dropdownOffset={{ y: DROPDOWN_OFFSET_Y }}
        clickableComponent={
          <StyledHeaderDropdownButton isUnfolded={isDropdownOpen}>
            <Trans>Options</Trans>
          </StyledHeaderDropdownButton>
        }
        onClose={handleResetContent}
        dropdownComponents={
          <ObjectOptionsDropdownContext.Provider
            value={{
              viewType,
              objectMetadataItem,
              recordIndexId,
              currentContentId,
              onContentChange: handleContentChange,
              resetContent: handleResetContent,
              dropdownId: OBJECT_OPTIONS_DROPDOWN_ID,
              handleRecordGroupOrderChangeWithModal,
            }}
          >
            <ObjectOptionsDropdownContent />
          </ObjectOptionsDropdownContext.Provider>
        }
      />
      <RecordGroupReorderConfirmationModal
        onConfirmClick={handleRecordGroupReorderConfirmClick}
      />
    </>
  );
};
