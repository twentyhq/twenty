import { useCallback, useMemo } from 'react';

import { type Attachment } from '@/activities/files/types/Attachment';
import { usePageLayoutIdFromContextStoreTargetedRecord } from '@/command-menu/pages/page-layout/hooks/usePageLayoutFromContextStoreTargetedRecord';
import { useWidgetInEditMode } from '@/command-menu/pages/page-layout/hooks/useWidgetInEditMode';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useUpdatePageLayoutWidget } from '@/page-layout/hooks/useUpdatePageLayoutWidget';
import { RichTextEditor } from '@/ui/input/editor/components/RichTextEditor';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared/utils';
import { type StandaloneRichTextConfiguration } from '~/generated/graphql';

const StyledContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: hidden;
  padding: ${({ theme }) => theme.spacing(6)};
`;

export const CommandMenuPageLayoutStandaloneRichTextSettings = () => {
  const { pageLayoutId } = usePageLayoutIdFromContextStoreTargetedRecord();

  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

  const { updatePageLayoutWidget } = useUpdatePageLayoutWidget(pageLayoutId);

  // Get dashboard ID from context store
  const targetedRecordsRule = useRecoilComponentValue(
    contextStoreTargetedRecordsRuleComponentState,
  );

  const dashboardId =
    targetedRecordsRule.mode === 'selection' &&
    targetedRecordsRule.selectedRecordIds.length === 1
      ? targetedRecordsRule.selectedRecordIds[0]
      : undefined;

  const configuration = widgetInEditMode?.configuration as
    | StandaloneRichTextConfiguration
    | undefined;

  const initialBodyV2 = useMemo(() => {
    if (isDefined(configuration) && 'body' in configuration) {
      return configuration.body;
    }
    return null;
  }, [configuration]);

  // Fetch attachments linked to this dashboard
  const { records: attachments } = useFindManyRecords<Attachment>({
    objectNameSingular: CoreObjectNameSingular.Attachment,
    filter: isDefined(dashboardId)
      ? { dashboardId: { eq: dashboardId } }
      : undefined,
    skip: !isDefined(dashboardId),
  });

  const handleChange = useCallback(
    (blocknote: string) => {
      if (!isDefined(widgetInEditMode)) return;

      updatePageLayoutWidget(widgetInEditMode.id, {
        configuration: {
          body: {
            blocknote,
            markdown: null,
          },
        },
      });
    },
    [updatePageLayoutWidget, widgetInEditMode],
  );

  if (!isDefined(widgetInEditMode) || !isDefined(dashboardId)) {
    return null;
  }

  return (
    <StyledContainer>
      <ScrollWrapper
        componentInstanceId={`scroll-wrapper-rich-text-settings-${widgetInEditMode.id}`}
      >
        <RichTextEditor
          initialBodyV2={initialBodyV2}
          targetableObject={{
            id: dashboardId,
            targetObjectNameSingular: CoreObjectNameSingular.Dashboard,
          }}
          attachments={attachments}
          onChange={handleChange}
          readonly={false}
        />
      </ScrollWrapper>
    </StyledContainer>
  );
};
