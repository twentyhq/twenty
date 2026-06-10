import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type FieldMetadataItemRelation } from '@/object-metadata/types/FieldMetadataItemRelation';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { FormFieldInputContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputContainer';
import { FormFieldInputInnerContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputInnerContainer';
import { FormFieldInputRowContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputRowContainer';
import { FormSingleRecordFieldChip } from '@/object-record/record-field/ui/form-types/components/FormSingleRecordFieldChip';
import { SingleRecordPicker } from '@/object-record/record-picker/single-record-picker/components/SingleRecordPicker';
import { singleRecordPickerSearchFilterComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerSearchFilterComponentState';
import { singleRecordPickerSelectedIdComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerSelectedIdComponentState';
import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useCallback, useContext, useId } from 'react';
import { isDefined, isValidUuid } from 'twenty-shared/utils';
import { IconChevronDown, IconForbid } from 'twenty-ui-deprecated/display';
import {
  ThemeContext,
  themeCssVariables,
} from 'twenty-ui-deprecated/theme-constants';
import { type JsonValue } from 'type-fest';

const StyledFormSelectContainerWrapper = styled.div<{ readonly?: boolean }>`
  cursor: ${({ readonly }) => (readonly ? 'default' : 'pointer')};
  display: flex;
  height: 32px;
  width: 100%;
`;

const StyledIconButton = styled.div`
  display: flex;
  padding-right: ${themeCssVariables.spacing[2]};
`;

export type FormMorphRelationToOneValue = {
  targetObjectMetadataId: string;
  id: string;
} | null;

type FormMorphRelationToOneFieldInputProps = {
  label?: string;
  morphRelations: FieldMetadataItemRelation[];
  defaultValue?: FormMorphRelationToOneValue;
  onChange: (value: JsonValue) => void;
  onClear?: () => void;
  readonly?: boolean;
  testId?: string;
};

export const FormMorphRelationToOneFieldInput = ({
  label,
  morphRelations,
  defaultValue,
  onChange,
  onClear,
  readonly,
  testId,
}: FormMorphRelationToOneFieldInputProps) => {
  const { theme } = useContext(ThemeContext);
  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const readableObjectNameSingulars = [
    ...new Set(
      morphRelations
        .filter(
          (morphRelation) =>
            objectPermissionsByObjectMetadataId[
              morphRelation.targetObjectMetadata.id
            ]?.canReadObjectRecords === true,
        )
        .map(
          (morphRelation) => morphRelation.targetObjectMetadata.nameSingular,
        ),
    ),
  ];

  const recordId = isDefined(defaultValue) ? defaultValue.id : null;

  const selectedObjectMetadataItem = isDefined(defaultValue)
    ? objectMetadataItems.find(
        (objectMetadataItem) =>
          objectMetadataItem.id === defaultValue.targetObjectMetadataId,
      )
    : undefined;

  const selectedObjectNameSingular =
    selectedObjectMetadataItem?.nameSingular ?? readableObjectNameSingulars[0];

  const { record: selectedRecord } = useFindOneRecord({
    objectRecordId:
      isDefined(recordId) && isValidUuid(recordId) ? recordId : '',
    objectNameSingular: selectedObjectNameSingular ?? '',
    withSoftDeleted: true,
    skip:
      !isDefined(recordId) ||
      !isValidUuid(recordId) ||
      !isDefined(selectedObjectNameSingular),
  });

  const componentId = useId();
  const dropdownId = `form-morph-record-picker-${componentId}`;

  const { closeDropdown } = useCloseDropdown();

  const setSingleRecordPickerSearchFilter = useSetAtomComponentState(
    singleRecordPickerSearchFilterComponentState,
    dropdownId,
  );

  const setSingleRecordPickerSelectedId = useSetAtomComponentState(
    singleRecordPickerSelectedIdComponentState,
    dropdownId,
  );

  const handleCloseRelationPickerDropdown = useCallback(() => {
    setSingleRecordPickerSearchFilter('');
  }, [setSingleRecordPickerSearchFilter]);

  const handleMorphItemSelected = (
    selectedMorphItem: RecordPickerPickableMorphItem | null | undefined,
  ) => {
    if (!isDefined(selectedMorphItem)) {
      if (defaultValue === null) {
        onClear?.();
      } else {
        onChange(null);
      }
      closeDropdown(dropdownId);

      return;
    }

    if (recordId === selectedMorphItem.recordId) {
      onClear?.();
    } else {
      onChange({
        targetObjectMetadataId: selectedMorphItem.objectMetadataId,
        id: selectedMorphItem.recordId,
      });
    }
    closeDropdown(dropdownId);
  };

  const handleUnlinkRecord = (event?: React.MouseEvent<HTMLDivElement>) => {
    event?.stopPropagation();
    onClear?.();
  };

  const handleOpenDropdown = () => {
    if (isDefined(recordId) && isValidUuid(recordId)) {
      setSingleRecordPickerSelectedId(recordId);
    } else {
      setSingleRecordPickerSelectedId(undefined);
    }
  };

  const draftValue =
    defaultValue === null
      ? ({ type: 'no-record', value: null } as const)
      : ({ type: 'static', value: recordId ?? '' } as const);

  const isReadonly = readonly || readableObjectNameSingulars.length === 0;

  return (
    <FormFieldInputContainer data-testid={testId}>
      {label ? <InputLabel>{label}</InputLabel> : null}
      <FormFieldInputRowContainer>
        {isReadonly ? (
          <StyledFormSelectContainerWrapper readonly>
            <FormFieldInputInnerContainer
              formFieldInputInstanceId={componentId}
              hasRightElement={false}
            >
              <FormSingleRecordFieldChip
                draftValue={draftValue}
                selectedRecord={selectedRecord}
                objectNameSingular={selectedObjectNameSingular ?? ''}
                onRemove={handleUnlinkRecord}
                disabled={isReadonly}
              />
            </FormFieldInputInnerContainer>
          </StyledFormSelectContainerWrapper>
        ) : (
          <Dropdown
            dropdownId={dropdownId}
            dropdownPlacement="bottom-start"
            clickableComponentWidth="100%"
            onClose={handleCloseRelationPickerDropdown}
            onOpen={handleOpenDropdown}
            dropdownOffset={{
              y: parseInt(theme.spacing[1], 10),
            }}
            clickableComponent={
              <StyledFormSelectContainerWrapper>
                <FormFieldInputInnerContainer
                  formFieldInputInstanceId={componentId}
                  hasRightElement={false}
                  hoverable
                  preventFocusStackUpdate={true}
                >
                  <FormSingleRecordFieldChip
                    draftValue={draftValue}
                    selectedRecord={selectedRecord}
                    objectNameSingular={selectedObjectNameSingular ?? ''}
                    onRemove={handleUnlinkRecord}
                    disabled={isReadonly}
                  />
                  <StyledIconButton>
                    <IconChevronDown
                      size={theme.icon.size.md}
                      color={theme.font.color.light}
                    />
                  </StyledIconButton>
                </FormFieldInputInnerContainer>
              </StyledFormSelectContainerWrapper>
            }
            dropdownComponents={
              <SingleRecordPicker
                focusId={dropdownId}
                componentInstanceId={dropdownId}
                EmptyIcon={IconForbid}
                emptyLabel={t`No record`}
                onCancel={() => closeDropdown(dropdownId)}
                onMorphItemSelected={handleMorphItemSelected}
                objectNameSingulars={readableObjectNameSingulars}
                recordPickerInstanceId={dropdownId}
                dropdownWidth={GenericDropdownContentWidth.ExtraLarge}
              />
            }
          />
        )}
      </FormFieldInputRowContainer>
    </FormFieldInputContainer>
  );
};
