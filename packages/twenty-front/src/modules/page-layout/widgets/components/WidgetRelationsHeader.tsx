import { RecordTargetsInlineCell } from '@/object-record/record-field/ui/components/RecordTargetsInlineCell';
import { useObjectMorphJunctionConfig } from '@/object-record/record-field/ui/hooks/useObjectMorphJunctionConfig';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { SidePanelProvider } from '@/ui/layout/side-panel/contexts/SidePanelContext';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  padding: ${themeCssVariables.spacing[2]};
  width: 100%;
`;

export const WidgetRelationsHeader = () => {
  const targetRecord = useTargetRecord();
  const { isInSidePanel } = useLayoutRenderingContext();

  const junctionConfig = useObjectMorphJunctionConfig({
    objectNameSingular: targetRecord.targetObjectNameSingular,
  });

  if (!isDefined(junctionConfig)) {
    return null;
  }

  return (
    <SidePanelProvider value={{ isInSidePanel }}>
      <StyledContainer>
        <RecordTargetsInlineCell
          objectNameSingular={targetRecord.targetObjectNameSingular}
          recordId={targetRecord.id}
          instanceIdPrefix={`widget-relations-header${isInSidePanel ? '-side-panel' : ''}`}
          showLabel
        />
      </StyledContainer>
    </SidePanelProvider>
  );
};
