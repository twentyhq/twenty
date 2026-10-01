import { ObjectOptionsDropdownDateFieldSelectContent } from '@/object-record/object-options-dropdown/components/ObjectOptionsDropdownDateFieldSelectContent';
import { useObjectOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsDropdown';
import { recordIndexCalendarFieldMetadataIdComponentState } from '@/object-record/record-index/states/recordIndexCalendarFieldMetadataIdComponentState';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useUpdateCurrentView } from '@/views/hooks/useUpdateCurrentView';
import { useGetAvailableDateFields } from '@/views/view-picker/hooks/useGetAvailableDateFields';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';

export const ObjectOptionsDropdownCalendarFieldsContent = () => {
  const { t } = useLingui();

  const { resetContent } = useObjectOptionsDropdown();

  const { updateCurrentView } = useUpdateCurrentView();
  const { availableDateFields } = useGetAvailableDateFields();

  const [
    recordIndexCalendarFieldMetadataId,
    setRecordIndexCalendarFieldMetadataId,
  ] = useAtomComponentState(recordIndexCalendarFieldMetadataIdComponentState);

  const handleCalendarFieldChange = async (fieldMetadataId: string | null) => {
    if (!isDefined(fieldMetadataId)) {
      return;
    }

    setRecordIndexCalendarFieldMetadataId(fieldMetadataId);

    try {
      await updateCurrentView({
        startFieldMetadataId: fieldMetadataId,
        endFieldMetadataId: null,
      });
    } catch (error) {
      setRecordIndexCalendarFieldMetadataId(recordIndexCalendarFieldMetadataId);
      throw error;
    }
  };

  return (
    <ObjectOptionsDropdownDateFieldSelectContent
      title={t`Date field`}
      selectableFields={availableDateFields}
      selectedFieldMetadataId={recordIndexCalendarFieldMetadataId}
      onBack={resetContent}
      onSelect={handleCalendarFieldChange}
    />
  );
};
