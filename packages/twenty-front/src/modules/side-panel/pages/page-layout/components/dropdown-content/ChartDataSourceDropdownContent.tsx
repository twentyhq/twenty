import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { filterReadableActiveObjectMetadataItems } from '@/object-metadata/utils/filterReadableActiveObjectMetadataItems';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { usePageLayoutSidePanelTarget } from '@/side-panel/pages/page-layout/hooks/usePageLayoutSidePanelTarget';
import { useResetChartDraftFiltersSettings } from '@/side-panel/pages/page-layout/hooks/useResetChartDraftFiltersSettings';
import { useUpdateCurrentWidgetConfig } from '@/side-panel/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { ChartSettingsDropdownSection } from '@/side-panel/pages/page-layout/components/chart-settings/ChartSettingsDropdownSection';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import { filterBySearchQuery } from '~/utils/filterBySearchQuery';

export const ChartDataSourceDropdownContent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const { pageLayoutId } = usePageLayoutSidePanelTarget();

  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

  const currentObjectMetadataItemId = widgetInEditMode?.objectMetadataId as
    | string
    | undefined;

  const objectsWithReadAccess = filterReadableActiveObjectMetadataItems(
    objectMetadataItems,
    objectPermissionsByObjectMetadataId,
  );
  const regularObjects = objectsWithReadAccess
    .filter((item) => !item.isSystem)
    .sort((firstObject, secondObject) =>
      firstObject.labelPlural.localeCompare(secondObject.labelPlural),
    );
  const systemObjects = objectsWithReadAccess
    .filter((item) => item.isSystem)
    .sort((firstObject, secondObject) =>
      firstObject.labelPlural.localeCompare(secondObject.labelPlural),
    );
  const searchableObjects = [...regularObjects, ...systemObjects];

  const availableObjectMetadataItems = filterBySearchQuery({
    items: searchableObjects,
    searchQuery,
    getSearchableValues: (item) => [item.labelPlural, item.namePlural],
  });

  const { updateCurrentWidgetConfig } =
    useUpdateCurrentWidgetConfig(pageLayoutId);

  const { resetChartDraftFiltersSettings } =
    useResetChartDraftFiltersSettings();

  const handleSelectSource = (newObjectMetadataItemId: string) => {
    if (currentObjectMetadataItemId !== newObjectMetadataItemId) {
      updateCurrentWidgetConfig({
        objectMetadataId: newObjectMetadataItemId,
        configToUpdate: {
          aggregateFieldMetadataId: undefined,
          primaryAxisGroupByFieldMetadataId: undefined,
          primaryAxisGroupBySubFieldName: undefined,
          secondaryAxisGroupByFieldMetadataId: undefined,
          secondaryAxisGroupBySubFieldName: undefined,
          primaryAxisOrderBy: undefined,
          secondaryAxisOrderBy: undefined,
          groupByFieldMetadataId: undefined,
          groupBySubFieldName: undefined,
          filter: {},
          ratioAggregateConfig: undefined,
        },
      });

      if (isDefined(currentObjectMetadataItemId)) {
        resetChartDraftFiltersSettings(currentObjectMetadataItemId);
      }
    }
  };

  return (
    <>
      <Dropdown.Search
        placeholder={t`Search objects`}
        aria-label={t`Search objects`}
        onValueChange={setSearchQuery}
        value={searchQuery}
      />
      <ChartSettingsDropdownSection>
        <Dropdown.SelectionGroup
          aria-label={t`Source`}
          value={currentObjectMetadataItemId ?? null}
          onValueChange={(value) => {
            if (isDefined(value)) {
              handleSelectSource(value);
            }
          }}
        >
          {availableObjectMetadataItems.map((objectMetadataItem) => (
            <Dropdown.OptionItem
              key={objectMetadataItem.id}
              value={objectMetadataItem.id}
              startIcon={
                <SelectOptionIcon
                  Icon={() => (
                    <ObjectMetadataIcon
                      objectMetadataItem={objectMetadataItem}
                    />
                  )}
                />
              }
            >
              {objectMetadataItem.labelPlural}
            </Dropdown.OptionItem>
          ))}
        </Dropdown.SelectionGroup>
        {!isNonEmptyArray(availableObjectMetadataItems) && (
          <Dropdown.Empty>{t`No results found`}</Dropdown.Empty>
        )}
      </ChartSettingsDropdownSection>
    </>
  );
};
