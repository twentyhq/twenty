import { getWidgetConfigurationViewId } from '@/page-layout/utils/getWidgetConfigurationViewId';
import { RecordTableSettingsFieldVisibility } from '@/side-panel/pages/page-layout/components/record-table-settings/RecordTableSettingsFieldVisibility';
import { usePageLayoutIdFromContextStore } from '@/side-panel/pages/page-layout/hooks/usePageLayoutIdFromContextStore';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui-deprecated/theme-constants';

const StyledContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[2]};
`;

export const SidePanelFieldRelationTableFieldsSubPage = () => {
  const { pageLayoutId } = usePageLayoutIdFromContextStore();
  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

  if (!isDefined(widgetInEditMode)) {
    return null;
  }

  const viewId = getWidgetConfigurationViewId(widgetInEditMode.configuration);

  if (!isDefined(viewId)) {
    return null;
  }

  return (
    <StyledContainer>
      <RecordTableSettingsFieldVisibility
        viewId={viewId}
        widgetId={widgetInEditMode.id}
        pageLayoutId={pageLayoutId}
      />
    </StyledContainer>
  );
};
