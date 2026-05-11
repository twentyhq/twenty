import { useFieldMetadataItemByIdOrThrow } from '@/object-metadata/hooks/useFieldMetadataItemByIdOrThrow';
import { getEnabledAddressSubFields } from '@/object-metadata/utils/getEnabledAddressSubFields';
import { resolveAddressSortSubField } from '@/object-metadata/utils/resolveAddressSortSubField';
import { resolvePrimaryFullNameSortSubField } from '@/object-metadata/utils/resolvePrimaryFullNameSortSubField';
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
import { ALLOWED_FULL_NAME_SORT_SUBFIELDS } from 'twenty-shared/constants';
import {
  type AllowedAddressSubField,
  type AllowedFullNameSortSubField,
  type FieldMetadataSettingsMapping,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconArrowDown, IconArrowUp } from 'twenty-ui/display';
import { MenuItemSelect } from 'twenty-ui/navigation';
import {
  FieldMetadataType,
  ViewSortDirection,
} from '~/generated-metadata/graphql';

type EditableSortChipProps = {
  recordSort: RecordSort;
};

type SubFieldOption = {
  value: AllowedFullNameSortSubField | AllowedAddressSubField;
  label: string;
};

type SubFieldState = {
  options: SubFieldOption[];
  resolvedValue: string;
};

const StyledSubFieldTrigger = styled.span`
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
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

  const subFieldState = useMemo<SubFieldState | undefined>(() => {
    if (fieldMetadataItem.type === FieldMetadataType.FULL_NAME) {
      const labels: Record<AllowedFullNameSortSubField, string> = {
        firstName: t`First name`,
        lastName: t`Last name`,
      };
      return {
        options: ALLOWED_FULL_NAME_SORT_SUBFIELDS.map((value) => ({
          value,
          label: labels[value],
        })),
        resolvedValue: resolvePrimaryFullNameSortSubField({
          requestedPrimarySubField: recordSort.subFieldName,
        }),
      };
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
      const addressSettings = fieldMetadataItem.settings as
        | FieldMetadataSettingsMapping[FieldMetadataType.ADDRESS]
        | null
        | undefined;
      return {
        options: getEnabledAddressSubFields(addressSettings).map((value) => ({
          value,
          label: labels[value],
        })),
        resolvedValue: resolveAddressSortSubField({
          settings: addressSettings,
          compositeSubField: recordSort.subFieldName,
        }),
      };
    }
    return undefined;
  }, [
    fieldMetadataItem.type,
    fieldMetadataItem.settings,
    recordSort.subFieldName,
    t,
  ]);

  const selectedSubFieldLabel = subFieldState?.options.find(
    (option) => option.value === subFieldState.resolvedValue,
  )?.label;

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

  const subFieldNode =
    isDefined(subFieldState) && isDefined(selectedSubFieldLabel) ? (
      <Dropdown
        dropdownId={subFieldDropdownId}
        clickableComponent={
          <StyledSubFieldTrigger>{selectedSubFieldLabel}</StyledSubFieldTrigger>
        }
        dropdownComponents={
          <DropdownContent>
            <DropdownMenuItemsContainer>
              {subFieldState.options.map((option) => (
                <MenuItemSelect
                  key={option.value}
                  text={option.label}
                  selected={option.value === subFieldState.resolvedValue}
                  onClick={() => handleSubFieldSelect(option.value)}
                />
              ))}
            </DropdownMenuItemsContainer>
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
