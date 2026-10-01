import { ObjectOptionsDropdownDateFieldSelectContent } from '@/object-record/object-options-dropdown/components/ObjectOptionsDropdownDateFieldSelectContent';
import { useObjectOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsDropdown';
import { getCompatibleEndDateFields } from '@/views/utils/getCompatibleEndDateFields';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { useUpdateCurrentView } from '@/views/hooks/useUpdateCurrentView';
import { useGetAvailableDateFields } from '@/views/view-picker/hooks/useGetAvailableDateFields';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';

type ObjectOptionsDropdownTimelineDateFieldContentProps = {
  dateFieldRole: 'start' | 'end';
};

export const ObjectOptionsDropdownTimelineDateFieldContent = ({
  dateFieldRole,
}: ObjectOptionsDropdownTimelineDateFieldContentProps) => {
  const { t } = useLingui();

  const { onContentChange } = useObjectOptionsDropdown();

  const { currentView } = useGetCurrentViewOnly();
  const { updateCurrentView } = useUpdateCurrentView();
  const { availableDateFields } = useGetAvailableDateFields();

  const selectableFields =
    dateFieldRole === 'start'
      ? availableDateFields
      : getCompatibleEndDateFields({
          dateFields: availableDateFields,
          startFieldMetadataId: currentView?.startFieldMetadataId,
        });

  const handleStartFieldChange = async (startFieldMetadataId: string) => {
    const isEndFieldStillCompatible = getCompatibleEndDateFields({
      dateFields: availableDateFields,
      startFieldMetadataId,
    }).some((field) => field.id === currentView?.endFieldMetadataId);

    await updateCurrentView({
      startFieldMetadataId,
      ...(isEndFieldStillCompatible ? {} : { endFieldMetadataId: null }),
    });
  };

  const handleSelect = async (fieldMetadataId: string | null) => {
    if (dateFieldRole === 'end') {
      await updateCurrentView({ endFieldMetadataId: fieldMetadataId });
      return;
    }

    if (isDefined(fieldMetadataId)) {
      await handleStartFieldChange(fieldMetadataId);
    }
  };

  return (
    <ObjectOptionsDropdownDateFieldSelectContent
      title={
        dateFieldRole === 'start' ? t`Start date field` : t`End date field`
      }
      selectableFields={selectableFields}
      selectedFieldMetadataId={
        dateFieldRole === 'start'
          ? currentView?.startFieldMetadataId
          : currentView?.endFieldMetadataId
      }
      canSelectNone={dateFieldRole === 'end'}
      onBack={() => onContentChange('layout')}
      onSelect={handleSelect}
    />
  );
};
