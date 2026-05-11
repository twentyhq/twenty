import { useFieldMetadataItemByIdOrThrow } from '@/object-metadata/hooks/useFieldMetadataItemByIdOrThrow';
import { getDefaultSortSubFieldForAddress } from '@/object-metadata/utils/getDefaultSortSubFieldForAddress';
import { getDefaultSortSubFieldForFullName } from '@/object-metadata/utils/getDefaultSortSubFieldForFullName';
import { getEnabledAddressSubFields } from '@/object-metadata/utils/getEnabledAddressSubFields';
import { useRemoveRecordSort } from '@/object-record/record-sort/hooks/useRemoveRecordSort';
import { useUpsertRecordSort } from '@/object-record/record-sort/hooks/useUpsertRecordSort';
import { type RecordSort } from '@/object-record/record-sort/types/RecordSort';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { SortOrFilterChip } from '@/views/components/SortOrFilterChip';
import { useLingui } from '@lingui/react/macro';
import { styled } from '@linaria/react';
import { useMemo } from 'react';
import { ALLOWED_FULL_NAME_SUBFIELDS } from 'twenty-shared/constants';
import {
  type AllowedAddressSubField,
  type AllowedFullNameSubField,
} from 'twenty-shared/types';
import { IconArrowDown, IconArrowUp } from 'twenty-ui/display';
import { MenuItemSelect } from 'twenty-ui/navigation';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import {
  FieldMetadataType,
  ViewSortDirection,
} from '~/generated-metadata/graphql';

type EditableSortChipProps = {
  recordSort: RecordSort;
};

type SubFieldOption = { value: string; label: string };

const StyledSubFieldTrigger = styled.span`
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const StyledDropdownContentPadding = styled.div`
  padding: ${themeCssVariables.spacing[1]} 0;
`;

export const EditableSortChip = ({ recordSort }: EditableSortChipProps) => {
  const { t } = useLingui();
  const { removeRecordSort } = useRemoveRecordSort();
  const { upsertRecordSort } = useUpsertRecordSort();
  const { closeDropdown } = useCloseDropdown();

  const { fieldMetadataItem } = useFieldMetadataItemByIdOrThrow(
    recordSort.fieldMetadataId,
  );

  const subFieldDropdownId = `sort-subfield-${recordSort.fieldMetadataId}`;

  const subFieldOptions = useMemo<SubFieldOption[] | undefined>(() => {
    if (fieldMetadataItem.type === FieldMetadataType.FULL_NAME) {
      const labels: Record<AllowedFullNameSubField, string> = {
        firstName: t`First name`,
        lastName: t`Last name`,
      };
      return ALLOWED_FULL_NAME_SUBFIELDS.map((value) => ({
        value,
        label: labels[value],
      }));
    }
    if (fieldMetadataItem.type === FieldMetadataType.ADDRESS) {
      const labels: Record<AllowedAddressSubField, string> = {
        addressStreet1: t`Address 1`,
        addressStreet2: t`Address 2`,
        addressCity: t`City`,
        addressState: t`State`,
        addressPostcode: t`Postcode`,
        addressCountry: t`Country`,
        addressLat: t`Latitude`,
        addressLng: t`Longitude`,
      };
      return getEnabledAddressSubFields(fieldMetadataItem.settings).map(
        (value) => ({ value, label: labels[value] }),
      );
    }
    return undefined;
  }, [fieldMetadataItem.type, fieldMetadataItem.settings, t]);

  const resolvedSubField = useMemo(() => {
    if (recordSort.subFieldName != null) {
      return recordSort.subFieldName;
    }
    if (fieldMetadataItem.type === FieldMetadataType.FULL_NAME) {
      return getDefaultSortSubFieldForFullName();
    }
    if (fieldMetadataItem.type === FieldMetadataType.ADDRESS) {
      return getDefaultSortSubFieldForAddress(fieldMetadataItem.settings);
    }
    return undefined;
  }, [
    recordSort.subFieldName,
    fieldMetadataItem.type,
    fieldMetadataItem.settings,
  ]);

  const handleRemoveClick = () => {
    removeRecordSort(recordSort.fieldMetadataId);
  };

  const handleDirectionToggle = () => {
    upsertRecordSort({
      ...recordSort,
      direction:
        recordSort.direction === ViewSortDirection.ASC
          ? ViewSortDirection.DESC
          : ViewSortDirection.ASC,
    });
  };

  const handleSubFieldSelect = (value: string) => {
    upsertRecordSort({ ...recordSort, subFieldName: value });
    closeDropdown(subFieldDropdownId);
  };

  const selectedSubFieldLabel = subFieldOptions?.find(
    (option) => option.value === resolvedSubField,
  )?.label;

  const subFieldNode =
    subFieldOptions && selectedSubFieldLabel ? (
      <Dropdown
        dropdownId={subFieldDropdownId}
        clickableComponent={
          <StyledSubFieldTrigger>{selectedSubFieldLabel}</StyledSubFieldTrigger>
        }
        dropdownComponents={
          <DropdownContent>
            <StyledDropdownContentPadding>
              <DropdownMenuItemsContainer>
                {subFieldOptions.map((option) => (
                  <MenuItemSelect
                    key={option.value}
                    text={option.label}
                    selected={option.value === resolvedSubField}
                    onClick={() => handleSubFieldSelect(option.value)}
                  />
                ))}
              </DropdownMenuItemsContainer>
            </StyledDropdownContentPadding>
          </DropdownContent>
        }
        dropdownOffset={{ y: 4, x: 0 }}
        dropdownPlacement="bottom-start"
      />
    ) : undefined;

  return (
    <SortOrFilterChip
      key={recordSort.fieldMetadataId}
      testId={recordSort.fieldMetadataId}
      labelValue={fieldMetadataItem.label}
      labelSubField={subFieldNode}
      Icon={
        recordSort.direction === ViewSortDirection.DESC
          ? IconArrowDown
          : IconArrowUp
      }
      onRemove={handleRemoveClick}
      onClick={handleDirectionToggle}
      type="sort"
    />
  );
};
