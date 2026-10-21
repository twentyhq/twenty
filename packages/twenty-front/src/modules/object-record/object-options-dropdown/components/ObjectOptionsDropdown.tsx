import { useDropdownContextCurrentContentId } from '@/dropdown-context-state-management/hooks/useDropdownContextCurrentContentId';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { ObjectOptionsDropdownContent } from '@/object-record/object-options-dropdown/components/ObjectOptionsDropdownContent';
import { getObjectOptionsDropdownId } from '@/object-record/object-options-dropdown/utils/getObjectOptionsDropdownId';
import { ObjectOptionsDropdownContext } from '@/object-record/object-options-dropdown/states/contexts/ObjectOptionsDropdownContext';
import { type ObjectOptionsContentId } from '@/object-record/object-options-dropdown/types/ObjectOptionsContentId';
import { RecordGroupReorderConfirmationModal } from '@/object-record/record-group/components/RecordGroupReorderConfirmationModal';
import { useRecordGroupReorderConfirmationModal } from '@/object-record/record-group/hooks/useRecordGroupReorderConfirmationModal';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownButton } from '@/ui/layout/dropdown/components/DropdownButton';
import { DROPDOWN_OFFSET_Y } from '@/ui/layout/dropdown/constants/DropdownOffsetY';
import { type ViewType } from '@/views/types/ViewType';
import { Trans } from '@lingui/react/macro';

type ObjectOptionsDropdownProps = {
  viewType: ViewType;
  objectMetadataItem: EnrichedObjectMetadataItem;
  recordIndexId: string;
};

export const ObjectOptionsDropdown = ({
  recordIndexId,
  objectMetadataItem,
  viewType,
}: ObjectOptionsDropdownProps) => {
  const { currentContentId, handleContentChange, handleResetContent } =
    useDropdownContextCurrentContentId<ObjectOptionsContentId>();

  const dropdownId = getObjectOptionsDropdownId(recordIndexId);

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
        dropdownId={dropdownId}
        dropdownOffset={{ y: DROPDOWN_OFFSET_Y }}
        clickableComponent={
          <DropdownButton>
            <Trans>Options</Trans>
          </DropdownButton>
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
              dropdownId,
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
