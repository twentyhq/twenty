import { useRef } from 'react';

import { type Attachment } from '@/activities/files/types/Attachment';
import { getActivityTargetObjectFieldIdName } from '@/activities/utils/getActivityTargetObjectFieldIdName';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { isPageLayoutInEditModeComponentState } from '@/page-layout/states/isPageLayoutInEditModeComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { StandaloneRichTextEditorContent } from '@/page-layout/widgets/standalone-rich-text/components/StandaloneRichTextEditorContent';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared/utils';
import {
  FeatureFlagKey,
  PageLayoutType,
  type StandaloneRichTextConfiguration,
} from '~/generated-metadata/graphql';

const StyledContainer = styled.div<{ isPageLayoutInEditMode?: boolean }>`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: hidden;
  padding-left: ${({ theme, isPageLayoutInEditMode }) =>
    isPageLayoutInEditMode ? theme.spacing(5) : 0};
`;

type StandaloneRichTextWidgetProps = {
  widget: PageLayoutWidget;
};

export const StandaloneRichTextWidget = ({
  widget,
}: StandaloneRichTextWidgetProps) => {
  const containerElementRef = useRef<HTMLDivElement>(null);
  const isPageLayoutInEditMode = useRecoilComponentValue(
    isPageLayoutInEditModeComponentState,
  );

  const editingWidgetId = useRecoilComponentValue(
    pageLayoutEditingWidgetIdComponentState,
  );

  const { targetRecordIdentifier, layoutType } = useLayoutRenderingContext();
  const isAttachmentMigrated = useIsFeatureEnabled(
    FeatureFlagKey.IS_ATTACHMENT_MIGRATED,
  );

  const isDashboard = layoutType === PageLayoutType.DASHBOARD;
  const dashboardId = isDashboard ? targetRecordIdentifier?.id : undefined;
  const attachmentTargetFieldIdName = getActivityTargetObjectFieldIdName({
    nameSingular: CoreObjectNameSingular.Dashboard,
    isMorphRelation: isAttachmentMigrated,
  });

  const configuration = widget.configuration as
    | StandaloneRichTextConfiguration
    | undefined;

  const currentBody = configuration?.body?.blocknote ?? '';

  const { records: attachments } = useFindManyRecords<Attachment>({
    objectNameSingular: CoreObjectNameSingular.Attachment,
    filter: isDefined(dashboardId)
      ? { [attachmentTargetFieldIdName]: { eq: dashboardId } }
      : undefined,
    skip: !isDefined(dashboardId),
  });

  const isThisWidgetBeingEdited = editingWidgetId === widget.id;
  const isEditable = isPageLayoutInEditMode && isThisWidgetBeingEdited;

  if (!isDefined(dashboardId)) {
    return null;
  }

  return (
    <StyledContainer
      ref={containerElementRef}
      isPageLayoutInEditMode={isPageLayoutInEditMode}
    >
      <ScrollWrapper
        componentInstanceId={`scroll-wrapper-rich-text-widget-${widget.id}`}
      >
        <StandaloneRichTextEditorContent
          key={isEditable ? 'editing' : 'readonly'}
          widget={widget}
          currentBody={currentBody}
          attachments={attachments}
          isEditable={isEditable}
          containerElement={containerElementRef.current}
        />
      </ScrollWrapper>
    </StyledContainer>
  );
};
