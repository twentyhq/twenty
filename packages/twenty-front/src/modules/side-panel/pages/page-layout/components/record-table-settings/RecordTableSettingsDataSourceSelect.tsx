import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useCreateViewForRecordTableWidget } from '@/page-layout/widgets/record-table/hooks/useCreateViewForRecordTableWidget';
import { useDeleteViewForRecordTableWidget } from '@/page-layout/widgets/record-table/hooks/useDeleteViewForRecordTableWidget';
import { usePageLayoutIdFromContextStore } from '@/side-panel/pages/page-layout/hooks/usePageLayoutIdFromContextStore';
import { useUpdateCurrentWidgetConfig } from '@/side-panel/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';
import { MenuItemSelect } from 'twenty-ui/navigation';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { filterBySearchQuery } from '~/utils/filterBySearchQuery';

const StyledSearchInput = styled.input`
  background: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  padding: ${themeCssVariables.spacing[2]};
  width: 100%;

  &::placeholder {
    color: ${themeCssVariables.font.color.light};
  }
`;

const StyledObjectList = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow-y: auto;
`;

type RecordTableSettingsDataSourceSelectProps = {
  onObjectSelected?: () => void;
};

export const RecordTableSettingsDataSourceSelect = ({
  onObjectSelected,
}: RecordTableSettingsDataSourceSelectProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const { pageLayoutId } = usePageLayoutIdFromContextStore();
  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

  const currentObjectMetadataItemId = widgetInEditMode?.objectMetadataId as
    | string
    | undefined;

  const { updateCurrentWidgetConfig } =
    useUpdateCurrentWidgetConfig(pageLayoutId);

  const { createViewForRecordTableWidget } =
    useCreateViewForRecordTableWidget(pageLayoutId);

  const { deleteViewForRecordTableWidget } =
    useDeleteViewForRecordTableWidget();

  const { getIcon } = useIcons();

  const objectsWithReadAccess = objectMetadataItems.filter(
    (objectMetadataItem) => {
      const objectPermissions =
        objectPermissionsByObjectMetadataId[objectMetadataItem.id];

      return (
        isDefined(objectPermissions) &&
        objectPermissions.canReadObjectRecords &&
        objectMetadataItem.isActive &&
        !objectMetadataItem.isSystem
      );
    },
  );

  const sortedObjects = objectsWithReadAccess.sort((first, second) =>
    first.labelPlural.localeCompare(second.labelPlural),
  );

  const filteredObjects = filterBySearchQuery({
    items: sortedObjects,
    searchQuery,
    getSearchableValues: (item) => [item.labelPlural, item.namePlural],
  });

  const currentViewId =
    widgetInEditMode?.configuration &&
    'viewId' in widgetInEditMode.configuration
      ? (widgetInEditMode.configuration.viewId as string | undefined)
      : undefined;

  const handleSelectSource = async (newObjectMetadataItemId: string) => {
    if (currentObjectMetadataItemId === newObjectMetadataItemId) {
      return;
    }

    if (isDefined(currentViewId)) {
      await deleteViewForRecordTableWidget(currentViewId);
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

    if (isDefined(selectedObjectMetadataItem)) {
      await createViewForRecordTableWidget(selectedObjectMetadataItem);
    }

    onObjectSelected?.();
  };

  return (
    <>
      <StyledSearchInput
        autoFocus
        type="text"
        placeholder={t`Search objects`}
        onChange={(event) => setSearchQuery(event.target.value)}
        value={searchQuery}
      />
      <StyledObjectList>
        {filteredObjects.map((objectMetadataItem) => (
          <MenuItemSelect
            key={objectMetadataItem.id}
            text={objectMetadataItem.labelPlural}
            selected={currentObjectMetadataItemId === objectMetadataItem.id}
            LeftIcon={getIcon(objectMetadataItem.icon)}
            onClick={() => handleSelectSource(objectMetadataItem.id)}
          />
        ))}
      </StyledObjectList>
    </>
  );
};
