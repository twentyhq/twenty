import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { AdvancedFilterSidePanelContainer } from '@/object-record/advanced-filter/side-panel/components/AdvancedFilterSidePanelContainer';
import { RecordFilterGroupsComponentInstanceContext } from '@/object-record/record-filter-group/states/context/RecordFilterGroupsComponentInstanceContext';
import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { getRecordIndexIdFromObjectNamePluralAndViewId } from '@/object-record/utils/getRecordIndexIdFromObjectNamePluralAndViewId';
import { useRecordTableWidgetFilterCallbacks } from '@/page-layout/widgets/record-table/hooks/useRecordTableWidgetFilterCallbacks';
import { useRecordTableWidgetViewForDisplay } from '@/page-layout/widgets/record-table/hooks/useRecordTableWidgetViewForDisplay';
import { RecordTableSettingsFiltersInitializeStateEffect } from '@/side-panel/pages/page-layout/components/record-table-settings/RecordTableSettingsFiltersInitializeStateEffect';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledFilterSettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]};
`;

type RecordTableSettingsFiltersProps = {
  viewId: string;
  widgetId: string;
  pageLayoutId: string;
  objectMetadataId: string;
};

export const RecordTableSettingsFilters = ({
  viewId,
  widgetId,
  pageLayoutId,
  objectMetadataId,
}: RecordTableSettingsFiltersProps) => {
  const { view } = useRecordTableWidgetViewForDisplay({
    viewId,
    widgetId,
    pageLayoutId,
  });
  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: objectMetadataId,
  });

  const recordIndexId = getRecordIndexIdFromObjectNamePluralAndViewId(
    objectMetadataItem.namePlural,
    viewId,
  );

  const { handleFilterUpdate } = useRecordTableWidgetFilterCallbacks({
    pageLayoutId,
    widgetId,
    viewId,
    recordIndexId,
  });

  if (!isDefined(view)) {
    return null;
  }

  return (
    <StyledFilterSettingsContainer>
      <InputLabel>{t`Conditions`}</InputLabel>
      <RecordFilterGroupsComponentInstanceContext.Provider
        value={{ instanceId: recordIndexId }}
      >
        <RecordFiltersComponentInstanceContext.Provider
          value={{ instanceId: recordIndexId }}
        >
          <AdvancedFilterSidePanelContainer
            objectMetadataItem={objectMetadataItem}
            isWorkflowFindRecords={false}
            onUpdate={handleFilterUpdate}
          />
          <RecordTableSettingsFiltersInitializeStateEffect view={view} />
        </RecordFiltersComponentInstanceContext.Provider>
      </RecordFilterGroupsComponentInstanceContext.Provider>
    </StyledFilterSettingsContainer>
  );
};
