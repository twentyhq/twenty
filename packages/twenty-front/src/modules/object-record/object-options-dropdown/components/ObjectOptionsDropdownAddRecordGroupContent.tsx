import { useObjectOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsDropdown';
import { useAddRecordGroup } from '@/object-record/record-group/hooks/useAddRecordGroup';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { SingleRecordPickerMenuItemsWithSearch } from '@/object-record/record-picker/single-record-picker/components/SingleRecordPickerMenuItemsWithSearch';
import { SingleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/single-record-picker/states/contexts/SingleRecordPickerComponentInstanceContext';
import { singleRecordPickerSearchFilterComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerSearchFilterComponentState';
import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronLeft } from 'twenty-ui/icon';

export const ObjectOptionsDropdownAddRecordGroupContent = () => {
  const { t } = useLingui();
  const { onContentChange, dropdownId } = useObjectOptionsDropdown();
  const addRecordGroupPickerInstanceId = `${dropdownId}-add-record-group-picker`;
  const { currentView } = useGetCurrentViewOnly();

  const recordIndexGroupFieldMetadataItem = useAtomComponentStateValue(
    recordIndexGroupFieldMetadataItemComponentState,
  );

  const { addRecordGroup } = useAddRecordGroup();

  const setSingleRecordPickerSearchFilter = useSetAtomComponentState(
    singleRecordPickerSearchFilterComponentState,
    addRecordGroupPickerInstanceId,
  );

  const targetObjectNameSingular =
    recordIndexGroupFieldMetadataItem?.relation?.targetObjectMetadata
      .nameSingular;

  const excludedRecordIds = (currentView?.viewGroups ?? [])
    .map((viewGroup) => viewGroup.fieldValue)
    .filter(isNonEmptyString);

  if (!isDefined(targetObjectNameSingular)) {
    return null;
  }

  const handleBack = () => {
    setSingleRecordPickerSearchFilter('');
    onContentChange('recordGroups');
  };

  const handleRecordSelected = async (
    selectedItem?: RecordPickerPickableMorphItem,
  ) => {
    if (isDefined(selectedItem?.recordId)) {
      await addRecordGroup(selectedItem.recordId);
    }

    handleBack();
  };

  return (
    <SingleRecordPickerComponentInstanceContext.Provider
      value={{ instanceId: addRecordGroupPickerInstanceId }}
    >
      <DropdownContent>
        <DropdownMenuHeader
          StartComponent={
            <DropdownMenuHeaderLeftComponent
              onClick={handleBack}
              Icon={IconChevronLeft}
            />
          }
        >
          {t`New group`}
        </DropdownMenuHeader>
        <SingleRecordPickerMenuItemsWithSearch
          focusId={addRecordGroupPickerInstanceId}
          onCancel={handleBack}
          onMorphItemSelected={handleRecordSelected}
          objectNameSingulars={[targetObjectNameSingular]}
          excludedRecordIds={excludedRecordIds}
        />
      </DropdownContent>
    </SingleRecordPickerComponentInstanceContext.Provider>
  );
};
