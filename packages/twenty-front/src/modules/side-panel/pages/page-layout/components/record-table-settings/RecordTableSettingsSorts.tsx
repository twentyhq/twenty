import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { RecordSortsComponentInstanceContext } from '@/object-record/record-sort/states/context/RecordSortsComponentInstanceContext';
import { getRecordIndexIdFromObjectNamePluralAndViewId } from '@/object-record/utils/getRecordIndexIdFromObjectNamePluralAndViewId';
import { useRecordTableWidgetSortCallbacks } from '@/page-layout/widgets/record-table/hooks/useRecordTableWidgetSortCallbacks';
import { RecordTableSettingsSortsContent } from '@/side-panel/pages/page-layout/components/record-table-settings/RecordTableSettingsSortsContent';
import { RecordTableSettingsSortsInitializeStateEffect } from '@/side-panel/pages/page-layout/components/record-table-settings/RecordTableSettingsSortsInitializeStateEffect';
import { InputLabel } from '@/ui/input/components/internal/InputLabel/InputLabel';
import { type View } from '@/views/types/View';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';
import { useLingui } from '@lingui/react/macro';

const StyledSortSettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]};
`;

type RecordTableSettingsSortsProps = {
  view: View;
  widgetId: string;
  pageLayoutId: string;
};

export const RecordTableSettingsSorts = ({
  view,
  widgetId,
  pageLayoutId,
}: RecordTableSettingsSortsProps) => {
  const { t } = useLingui();
  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: view.objectMetadataId,
  });

  const recordIndexId = getRecordIndexIdFromObjectNamePluralAndViewId(
    objectMetadataItem.namePlural,
    view.id,
  );

  const { handleSortUpdate } = useRecordTableWidgetSortCallbacks({
    pageLayoutId,
    widgetId,
    viewId: view.id,
    recordIndexId,
  });

  return (
    <StyledSortSettingsContainer>
      <InputLabel>{t`Sorts`}</InputLabel>
      <RecordSortsComponentInstanceContext.Provider
        value={{ instanceId: recordIndexId }}
      >
        <RecordTableSettingsSortsContent
          fieldMetadataItems={objectMetadataItem.fields}
          onUpdate={handleSortUpdate}
        />
        <RecordTableSettingsSortsInitializeStateEffect view={view} />
      </RecordSortsComponentInstanceContext.Provider>
    </StyledSortSettingsContainer>
  );
};
