import { ChartSettingsDropdownSection } from '@/side-panel/pages/page-layout/components/chart-settings/ChartSettingsDropdownSection';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { filterReadableActiveObjectMetadataItems } from '@/object-metadata/utils/filterReadableActiveObjectMetadataItems';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useUpdatePageLayoutWidget } from '@/page-layout/hooks/useUpdatePageLayoutWidget';
import { recordTableWidgetViewDraftComponentState } from '@/page-layout/states/recordTableWidgetViewDraftComponentState';
import { useAddDraftViewForRecordTableWidget } from '@/page-layout/widgets/record-table/hooks/useAddDraftViewForRecordTableWidget';
import { getRecordTableWidgetLayoutViewType } from '@/page-layout/widgets/record-table/types/RecordTableWidgetLayoutViewType';
import { useRemoveDraftViewForRecordTableWidget } from '@/page-layout/widgets/record-table/hooks/useRemoveDraftViewForRecordTableWidget';
import { usePageLayoutSidePanelTarget } from '@/side-panel/pages/page-layout/hooks/usePageLayoutSidePanelTarget';
import { useUpdateCurrentWidgetConfig } from '@/side-panel/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useState } from 'react';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import { filterBySearchQuery } from '~/utils/filterBySearchQuery';
import { useLingui } from '@lingui/react/macro';

export const RecordTableDataSourceDropdownContent = () => {
  const { t } = useLingui();
  const [searchQuery, setSearchQuery] = useState('');
  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const { pageLayoutId } = usePageLayoutSidePanelTarget();
  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

  const currentObjectMetadataItemId = widgetInEditMode?.objectMetadataId as
    | string
    | undefined;

  const { updateCurrentWidgetConfig } =
    useUpdateCurrentWidgetConfig(pageLayoutId);
  const { addDraftViewForRecordTableWidget } =
    useAddDraftViewForRecordTableWidget(pageLayoutId);
  const { removeDraftViewForRecordTableWidget } =
    useRemoveDraftViewForRecordTableWidget(pageLayoutId);
  const { updatePageLayoutWidget } = useUpdatePageLayoutWidget(pageLayoutId);
  const recordTableWidgetViewDraft = useAtomComponentStateValue(
    recordTableWidgetViewDraftComponentState,
    pageLayoutId,
  );

  const readableActiveObjectMetadataItems =
    filterReadableActiveObjectMetadataItems(
      objectMetadataItems,
      objectPermissionsByObjectMetadataId,
    );

  const objectsWithReadAccess = readableActiveObjectMetadataItems.filter(
    (objectMetadataItem) => !objectMetadataItem.isSystem,
  );

  const sortedObjects = objectsWithReadAccess.sort((first, second) =>
    first.labelPlural.localeCompare(second.labelPlural),
  );

  const filteredObjects = filterBySearchQuery({
    items: sortedObjects,
    searchQuery,
    getSearchableValues: (item) => [item.labelPlural, item.namePlural],
  });

  const handleSelectSource = (newObjectMetadataItemId: string) => {
    if (currentObjectMetadataItemId === newObjectMetadataItemId) {
      return;
    }

    const currentLayoutViewType = getRecordTableWidgetLayoutViewType(
      isDefined(widgetInEditMode)
        ? recordTableWidgetViewDraft[widgetInEditMode.id]?.view.type
        : undefined,
    );

    if (isDefined(widgetInEditMode)) {
      removeDraftViewForRecordTableWidget(widgetInEditMode.id);
    }

    updateCurrentWidgetConfig({
      objectMetadataId: newObjectMetadataItemId,
      configToUpdate: {
        viewId: undefined,
      },
    });

    const selectedObjectMetadataItem = objectMetadataItems.find(
      (item) => item.id === newObjectMetadataItemId,
    );

    if (isDefined(selectedObjectMetadataItem) && isDefined(widgetInEditMode)) {
      addDraftViewForRecordTableWidget({
        widgetId: widgetInEditMode.id,
        objectMetadataItem: selectedObjectMetadataItem,
        targetViewType: currentLayoutViewType,
      });

      updatePageLayoutWidget(widgetInEditMode.id, {
        title: selectedObjectMetadataItem.labelPlural,
      });
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
        >
          {filteredObjects.map((objectMetadataItem) => (
            <Dropdown.OptionItem
              key={objectMetadataItem.id}
              value={objectMetadataItem.id}
              onSelect={() => handleSelectSource(objectMetadataItem.id)}
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
        {!isNonEmptyArray(filteredObjects) && (
          <Dropdown.Empty>{t`No results found`}</Dropdown.Empty>
        )}
      </ChartSettingsDropdownSection>
    </>
  );
};
