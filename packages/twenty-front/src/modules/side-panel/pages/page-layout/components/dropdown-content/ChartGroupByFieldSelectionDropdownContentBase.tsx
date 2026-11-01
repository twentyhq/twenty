import { isHiddenSystemField } from '@/object-metadata/utils/isHiddenSystemField';
import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';
import { isFieldMorphRelation } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelation';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { ChartGroupByFieldSelectionCompositeFieldView } from '@/side-panel/pages/page-layout/components/dropdown-content/ChartGroupByFieldSelectionCompositeFieldView';
import { ChartGroupByFieldSelectionMorphRelationFieldView } from '@/side-panel/pages/page-layout/components/dropdown-content/ChartGroupByFieldSelectionMorphRelationFieldView';
import { ChartGroupByFieldSelectionRelationFieldView } from '@/side-panel/pages/page-layout/components/dropdown-content/ChartGroupByFieldSelectionRelationFieldView';
import { ChartSettingsDropdownSection } from '@/side-panel/pages/page-layout/components/chart-settings/ChartSettingsDropdownSection';
import { ChartGroupByFieldSelectionContext } from '@/side-panel/pages/page-layout/contexts/ChartGroupByFieldSelectionContext';
import { useChartGroupByFieldSelection } from '@/side-panel/pages/page-layout/hooks/useChartGroupByFieldSelection';
import { type ChartGroupByFieldSelectionAxis } from '@/side-panel/pages/page-layout/types/ChartGroupByFieldSelectionAxis';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { t } from '@lingui/core/macro';
import { useMemo, useState } from 'react';
import {
  isDefined,
  isFieldMetadataSupportedInGroupBy,
  isNonEmptyArray,
} from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import { useIcons } from 'twenty-ui/icon';
import { normalizeSearchText } from 'twenty-ui/utilities';
import { RelationType } from '~/generated-metadata/graphql';
import { filterBySearchQuery } from '~/utils/filterBySearchQuery';

type ChartGroupByFieldSelectionDropdownContentBaseProps = {
  axis: ChartGroupByFieldSelectionAxis;
};

export const ChartGroupByFieldSelectionDropdownContentBase = ({
  axis,
}: ChartGroupByFieldSelectionDropdownContentBaseProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const selection = useChartGroupByFieldSelection({ axis });
  const { getIcon } = useIcons();
  const sourceObjectMetadataItem = selection?.sourceObjectMetadataItem;

  const groupableFields = useMemo(
    () =>
      (sourceObjectMetadataItem?.fields ?? []).filter((field) => {
        if (isHiddenSystemField(field)) {
          return false;
        }

        if (isFieldRelation(field)) {
          return field.relation?.type === RelationType.MANY_TO_ONE;
        }

        return isFieldMetadataSupportedInGroupBy({
          type: field.type,
          name: field.name,
          isSystem: field.isSystem ?? false,
          relationType: field.settings?.relationType ?? null,
        });
      }),
    [sourceObjectMetadataItem?.fields],
  );

  const availableFields = filterBySearchQuery({
    items: groupableFields,
    searchQuery,
    getSearchableValues: (field) => [field.label, field.name],
  });
  const noneOptionLabel = t`None`;
  const isNoneOptionVisible =
    axis === 'secondary' &&
    normalizeSearchText(noneOptionLabel).includes(
      normalizeSearchText(searchQuery),
    );

  if (!isDefined(selection)) {
    return null;
  }

  const { currentGroupByFieldMetadataId, selectField } = selection;

  return (
    <ChartGroupByFieldSelectionContext.Provider value={selection}>
      <Dropdown.Page id="root">
        <Dropdown.Search
          placeholder={t`Search fields`}
          aria-label={t`Search fields`}
          onValueChange={setSearchQuery}
          value={searchQuery}
        />
        <ChartSettingsDropdownSection>
          {isNoneOptionVisible && (
            <Dropdown.OptionItem
              onSelect={() => selectField({ fieldId: null })}
              selected={!isDefined(currentGroupByFieldMetadataId)}
            >
              {noneOptionLabel}
            </Dropdown.OptionItem>
          )}
          {availableFields.map((fieldMetadataItem) => {
            const hasFieldPage =
              isCompositeFieldType(fieldMetadataItem.type) ||
              isFieldRelation(fieldMetadataItem) ||
              isFieldMorphRelation(fieldMetadataItem);
            const fieldIcon = (
              <SelectOptionIcon Icon={getIcon(fieldMetadataItem.icon)} />
            );

            if (hasFieldPage) {
              return (
                <Dropdown.ActionItem
                  key={fieldMetadataItem.id}
                  page={fieldMetadataItem.id}
                  startIcon={fieldIcon}
                >
                  {fieldMetadataItem.label}
                </Dropdown.ActionItem>
              );
            }

            return (
              <Dropdown.OptionItem
                key={fieldMetadataItem.id}
                onSelect={() => selectField({ fieldId: fieldMetadataItem.id })}
                selected={
                  currentGroupByFieldMetadataId === fieldMetadataItem.id
                }
                startIcon={fieldIcon}
              >
                {fieldMetadataItem.label}
              </Dropdown.OptionItem>
            );
          })}
          {!isNonEmptyArray(availableFields) && !isNoneOptionVisible && (
            <Dropdown.Empty>{t`No fields available`}</Dropdown.Empty>
          )}
        </ChartSettingsDropdownSection>
      </Dropdown.Page>
      {groupableFields.map((fieldMetadataItem) => {
        if (isFieldMorphRelation(fieldMetadataItem)) {
          return (
            <ChartGroupByFieldSelectionMorphRelationFieldView
              key={fieldMetadataItem.id}
              pageId={fieldMetadataItem.id}
              morphField={fieldMetadataItem}
            />
          );
        }

        if (isFieldRelation(fieldMetadataItem)) {
          return (
            <ChartGroupByFieldSelectionRelationFieldView
              key={fieldMetadataItem.id}
              pageId={fieldMetadataItem.id}
              relationField={fieldMetadataItem}
            />
          );
        }

        if (!isCompositeFieldType(fieldMetadataItem.type)) {
          return null;
        }

        return (
          <ChartGroupByFieldSelectionCompositeFieldView
            key={fieldMetadataItem.id}
            pageId={fieldMetadataItem.id}
            compositeField={fieldMetadataItem}
            fieldMetadataId={fieldMetadataItem.id}
          />
        );
      })}
    </ChartGroupByFieldSelectionContext.Provider>
  );
};
