import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { isHiddenSystemField } from '@/object-metadata/utils/isHiddenSystemField';
import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';
import { isFieldMorphRelation } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelation';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { ChartGroupByFieldSelectionCompositeFieldView } from '@/side-panel/pages/page-layout/components/dropdown-content/ChartGroupByFieldSelectionCompositeFieldView';
import { ChartGroupByFieldSelectionMorphRelationFieldView } from '@/side-panel/pages/page-layout/components/dropdown-content/ChartGroupByFieldSelectionMorphRelationFieldView';
import { ChartGroupByFieldSelectionRelationFieldView } from '@/side-panel/pages/page-layout/components/dropdown-content/ChartGroupByFieldSelectionRelationFieldView';
import { ChartSettingsDropdownSection } from '@/side-panel/pages/page-layout/components/chart-settings/ChartSettingsDropdownSection';
import { usePageLayoutSidePanelTarget } from '@/side-panel/pages/page-layout/hooks/usePageLayoutSidePanelTarget';
import { useUpdateCurrentWidgetConfig } from '@/side-panel/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { type ChartConfiguration } from '@/side-panel/pages/page-layout/types/ChartConfiguration';
import { buildChartGroupByFieldConfigUpdate } from '@/side-panel/pages/page-layout/utils/buildChartGroupByFieldConfigUpdate';
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

type ChartGroupByFieldSelectionDropdownContentBaseProps<
  TConfiguration extends ChartConfiguration,
> = {
  fieldMetadataIdKey: keyof TConfiguration;
  subFieldNameKey: keyof TConfiguration;
};

export const ChartGroupByFieldSelectionDropdownContentBase = <
  TConfiguration extends ChartConfiguration,
>({
  fieldMetadataIdKey,
  subFieldNameKey,
}: ChartGroupByFieldSelectionDropdownContentBaseProps<TConfiguration>) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { objectMetadataItems } = useObjectMetadataItems();
  const { pageLayoutId } = usePageLayoutSidePanelTarget();
  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);
  const { updateCurrentWidgetConfig } =
    useUpdateCurrentWidgetConfig(pageLayoutId);
  const { getIcon } = useIcons();

  const configuration = widgetInEditMode?.configuration as TConfiguration;
  const currentGroupByFieldMetadataId = configuration?.[fieldMetadataIdKey] as
    | string
    | undefined;
  const currentSubFieldName = configuration?.[subFieldNameKey] as
    | string
    | undefined;
  const sourceObjectMetadataItem = objectMetadataItems.find(
    (item) => item.id === widgetInEditMode?.objectMetadataId,
  );

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
    fieldMetadataIdKey === 'secondaryAxisGroupByFieldMetadataId' &&
    normalizeSearchText(noneOptionLabel).includes(
      normalizeSearchText(searchQuery),
    );

  if (!isDefined(sourceObjectMetadataItem)) {
    return null;
  }

  const handleSelectField = ({
    fieldId,
    subFieldName = null,
  }: {
    fieldId: string | null;
    subFieldName?: string | null;
  }) => {
    updateCurrentWidgetConfig({
      configToUpdate: buildChartGroupByFieldConfigUpdate({
        configuration,
        fieldMetadataIdKey,
        subFieldNameKey,
        fieldId,
        subFieldName,
        objectMetadataItem: sourceObjectMetadataItem,
        objectMetadataItems,
      }),
    });
  };

  return (
    <>
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
              onSelect={() => handleSelectField({ fieldId: null })}
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
                onSelect={() =>
                  handleSelectField({ fieldId: fieldMetadataItem.id })
                }
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
        const isCurrentGroupByField =
          fieldMetadataItem.id === currentGroupByFieldMetadataId;
        const selectedSubFieldName = isCurrentGroupByField
          ? currentSubFieldName
          : undefined;
        const handleSelectSubField = (subFieldName: string) =>
          handleSelectField({
            fieldId: fieldMetadataItem.id,
            subFieldName,
          });

        if (isFieldMorphRelation(fieldMetadataItem)) {
          return (
            <ChartGroupByFieldSelectionMorphRelationFieldView
              key={fieldMetadataItem.id}
              pageId={fieldMetadataItem.id}
              morphField={fieldMetadataItem}
              currentFieldMetadataId={currentGroupByFieldMetadataId}
              currentSubFieldName={currentSubFieldName}
              onSelectTargetSubField={({ perTargetFieldId, subFieldName }) =>
                handleSelectField({ fieldId: perTargetFieldId, subFieldName })
              }
              onSelectTargetRecord={({ perTargetFieldId }) =>
                handleSelectField({ fieldId: perTargetFieldId })
              }
            />
          );
        }

        if (isFieldRelation(fieldMetadataItem)) {
          return (
            <ChartGroupByFieldSelectionRelationFieldView
              key={fieldMetadataItem.id}
              pageId={fieldMetadataItem.id}
              relationField={fieldMetadataItem}
              currentSubFieldName={selectedSubFieldName}
              isCurrentGroupByField={isCurrentGroupByField}
              onSelectSubField={handleSelectSubField}
              onSelectRecord={() =>
                handleSelectField({ fieldId: fieldMetadataItem.id })
              }
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
            currentSubFieldName={selectedSubFieldName}
            onSelectSubField={handleSelectSubField}
          />
        );
      })}
    </>
  );
};
