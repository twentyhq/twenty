import { isNonEmptyString } from '@sniptt/guards';
import { useEffect } from 'react';

import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';

import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { objectFilterDropdownSelectedOptionValuesComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSelectedOptionValuesComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { CURRENT_WORKSPACE_MEMBER_SELECTABLE_ITEM_ID } from 'twenty-shared/constants';
import { jsonRelationFilterValueSchema } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { relationFilterValueSchema } from '../view-filter-value/validation-schemas/relationFilterValueSchema';

type ViewBarFilterEffectProps = {
  filterDropdownId: string;
};

export const ViewBarFilterEffect = ({
  filterDropdownId,
}: ViewBarFilterEffectProps) => {
  const fieldMetadataItemUsedInDropdown = useRecoilComponentValueV2(
    fieldMetadataItemUsedInDropdownComponentSelector,
    filterDropdownId,
  );

  const setObjectFilterDropdownSelectedOptionValues =
    useSetRecoilComponentStateV2(
      objectFilterDropdownSelectedOptionValuesComponentState,
      filterDropdownId,
    );

  const currentRecordFilters = useRecoilComponentValueV2(
    currentRecordFiltersComponentState,
  );

  useEffect(() => {
    if (fieldMetadataItemUsedInDropdown?.type === 'RELATION') {
      const recordFilterUsedInDropdown = currentRecordFilters.find(
        (filter) =>
          filter.fieldMetadataId === fieldMetadataItemUsedInDropdown?.id,
      );

      let selectedRecordIds;
      try {
        const jsonRelationFilterValue = jsonRelationFilterValueSchema.parse(
          recordFilterUsedInDropdown?.value,
        );

        selectedRecordIds = jsonRelationFilterValue.selectedRecordIds;
      } catch {
        const relationFilterValue = relationFilterValueSchema.parse(
          recordFilterUsedInDropdown?.value,
        );

        selectedRecordIds = relationFilterValue.filter(
          (item) => item !== CURRENT_WORKSPACE_MEMBER_SELECTABLE_ITEM_ID,
        );
      }

      setObjectFilterDropdownSelectedOptionValues(selectedRecordIds);
    } else if (
      isDefined(fieldMetadataItemUsedInDropdown) &&
      ['SELECT', 'MULTI_SELECT'].includes(fieldMetadataItemUsedInDropdown.type)
    ) {
      const recordFilterUsedInDropdown = currentRecordFilters.find(
        (filter) =>
          filter.fieldMetadataId === fieldMetadataItemUsedInDropdown?.id,
      );

      const recordFilterSelectedRecords = isNonEmptyString(
        recordFilterUsedInDropdown?.value,
      )
        ? JSON.parse(recordFilterUsedInDropdown.value)
        : [];
      setObjectFilterDropdownSelectedOptionValues(recordFilterSelectedRecords);
    }
  }, [
    fieldMetadataItemUsedInDropdown,
    setObjectFilterDropdownSelectedOptionValues,
    currentRecordFilters,
  ]);

  return <></>;
};
