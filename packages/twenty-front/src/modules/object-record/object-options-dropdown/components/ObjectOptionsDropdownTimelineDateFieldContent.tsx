import { ObjectOptionsDropdownDateFieldSelectContent } from '@/object-record/object-options-dropdown/components/ObjectOptionsDropdownDateFieldSelectContent';
import { useObjectOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsDropdown';
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

  const { objectMetadataItem, onContentChange } = useObjectOptionsDropdown();

  const { currentView } = useGetCurrentViewOnly();
  const { updateCurrentView } = useUpdateCurrentView();
  const { availableDateFields } = useGetAvailableDateFields();

  const findField = (fieldMetadataId: string | null | undefined) =>
    objectMetadataItem.fields.find((field) => field.id === fieldMetadataId);

  const startFieldMetadataItem = findField(currentView?.startFieldMetadataId);

  // The server requires the end field to differ from the start field and
  // share its DATE or DATE_TIME type.
  const selectableFields =
    dateFieldRole === 'start'
      ? availableDateFields
      : availableDateFields.filter(
          (field) =>
            field.id !== startFieldMetadataItem?.id &&
            field.type === startFieldMetadataItem?.type,
        );

  const handleStartFieldChange = async (startFieldMetadataId: string) => {
    const startField = findField(startFieldMetadataId);
    const endField = findField(currentView?.endFieldMetadataId);

    const isEndFieldStillCompatible =
      isDefined(endField) &&
      endField.id !== startFieldMetadataId &&
      endField.type === startField?.type;

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
