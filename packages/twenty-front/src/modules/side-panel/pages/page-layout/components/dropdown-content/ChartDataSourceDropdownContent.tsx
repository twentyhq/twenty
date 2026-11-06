import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { filterReadableActiveObjectMetadataItems } from '@/object-metadata/utils/filterReadableActiveObjectMetadataItems';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { usePageLayoutSidePanelTarget } from '@/side-panel/pages/page-layout/hooks/usePageLayoutSidePanelTarget';
import { useResetChartDraftFiltersSettings } from '@/side-panel/pages/page-layout/hooks/useResetChartDraftFiltersSettings';
import { useUpdateCurrentWidgetConfig } from '@/side-panel/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { buildChartDataSourceConfigUpdate } from '@/side-panel/pages/page-layout/utils/buildChartDataSourceConfigUpdate';
import { isWidgetConfigurationOfTypeGraph } from '@/side-panel/pages/page-layout/utils/isWidgetConfigurationOfTypeGraph';
import { ChartSettingsDropdownSection } from '@/side-panel/pages/page-layout/components/chart-settings/ChartSettingsDropdownSection';
import { useState } from 'react';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import { filterBySearchQuery } from '~/utils/filterBySearchQuery';
import { useLingui } from '@lingui/react/macro';

export const ChartDataSourceDropdownContent = () => {
  const { t } = useLingui();
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
    const configuration = widgetInEditMode?.configuration;
    const newObjectMetadataItem = objectMetadataItems.find(
      (objectMetadataItem) => objectMetadataItem.id === newObjectMetadataItemId,
    );

    if (
      currentObjectMetadataItemId === newObjectMetadataItemId ||
      !isWidgetConfigurationOfTypeGraph(configuration) ||
      !isDefined(newObjectMetadataItem)
    ) {
      return;
    }

    updateCurrentWidgetConfig({
      objectMetadataId: newObjectMetadataItemId,
      configToUpdate: buildChartDataSourceConfigUpdate({
        configuration,
        objectMetadataItem: newObjectMetadataItem,
        objectMetadataItems,
      }),
    });

    if (isDefined(currentObjectMetadataItemId)) {
      resetChartDraftFiltersSettings(currentObjectMetadataItemId);
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
