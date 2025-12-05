import { useMemo } from 'react';

import { type Attachment } from '@/activities/files/types/Attachment';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { RichTextEditor } from '@/ui/input/editor/components/RichTextEditor';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared/utils';
import {
  PageLayoutType,
  type PageLayoutWidget,
  type StandaloneRichTextConfiguration,
} from '~/generated/graphql';

const StyledContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: hidden;
`;

const StyledEmptyState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${({ theme }) => theme.font.color.tertiary};
`;

type StandaloneRichTextWidgetProps = {
  widget: PageLayoutWidget;
};

export const StandaloneRichTextWidget = ({
  widget,
}: StandaloneRichTextWidgetProps) => {
  const { targetRecordIdentifier, layoutType } = useLayoutRenderingContext();

  const draftPageLayout = useRecoilComponentValue(
    pageLayoutDraftComponentState,
  );

  const draftWidget = draftPageLayout.tabs
    .flatMap((tab) => tab.widgets)
    .find((w) => w.id === widget.id);

  const isDashboard = layoutType === PageLayoutType.DASHBOARD;
  const dashboardId = isDashboard ? targetRecordIdentifier?.id : undefined;

  const configuration = (draftWidget?.configuration ?? widget.configuration) as
    | StandaloneRichTextConfiguration
    | undefined;

  const initialBodyV2 = useMemo(() => {
    if (isDefined(configuration) && 'body' in configuration) {
      return configuration.body;
    }
    return null;
  }, [configuration]);

  const { records: attachments } = useFindManyRecords<Attachment>({
    objectNameSingular: CoreObjectNameSingular.Attachment,
    filter: isDefined(dashboardId)
      ? { dashboardId: { eq: dashboardId } }
      : undefined,
    skip: !isDefined(dashboardId),
  });

  if (!isDefined(dashboardId)) {
    return (
      <StyledContainer>
        <StyledEmptyState>
          Rich text widget is only available on dashboards
        </StyledEmptyState>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
      <ScrollWrapper
        componentInstanceId={`scroll-wrapper-rich-text-widget-${widget.id}`}
      >
        <RichTextEditor
          initialBodyV2={initialBodyV2}
          targetableObject={{
            id: dashboardId,
            targetObjectNameSingular: CoreObjectNameSingular.Dashboard,
          }}
          attachments={attachments}
          onChange={() => {}}
          readonly={true}
          syncExternalContent={true}
        />
      </ScrollWrapper>
    </StyledContainer>
  );
};
