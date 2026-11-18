import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { AdvancedFilterSidePanelContainer } from '@/object-record/advanced-filter/side-panel/components/AdvancedFilterSidePanelContainer';
import { RecordFilterGroupsComponentInstanceContext } from '@/object-record/record-filter-group/states/context/RecordFilterGroupsComponentInstanceContext';
import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { getRecordIndexIdFromObjectNamePluralAndViewId } from '@/object-record/utils/getRecordIndexIdFromObjectNamePluralAndViewId';
import { useRecordTableWidgetFilterCallbacks } from '@/page-layout/widgets/record-table/hooks/useRecordTableWidgetFilterCallbacks';
import { RecordTableSettingsFiltersInitializeStateEffect } from '@/side-panel/pages/page-layout/components/record-table-settings/RecordTableSettingsFiltersInitializeStateEffect';
import { InputLabel } from '@/ui/input/components/internal/InputLabel/InputLabel';
import { type View } from '@/views/types/View';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';
import { useLingui } from '@lingui/react/macro';

const StyledFilterSettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]};
`;

type RecordTableSettingsFiltersProps = {
  view: View;
  widgetId: string;
  pageLayoutId: string;
};

export const RecordTableSettingsFilters = ({
  view,
  widgetId,
  pageLayoutId,
}: RecordTableSettingsFiltersProps) => {
  const { t } = useLingui();
  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: view.objectMetadataId,
  });

  const recordIndexId = getRecordIndexIdFromObjectNamePluralAndViewId(
    objectMetadataItem.namePlural,
    view.id,
  );

  const { handleFilterUpdate } = useRecordTableWidgetFilterCallbacks({
    pageLayoutId,
    widgetId,
    viewId: view.id,
    recordIndexId,
  });

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
