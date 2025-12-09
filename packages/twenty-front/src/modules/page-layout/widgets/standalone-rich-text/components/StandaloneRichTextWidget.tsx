import { useMemo } from 'react';

import { BLOCK_SCHEMA } from '@/activities/blocks/constants/Schema';
import { useUploadAttachmentFile } from '@/activities/files/hooks/useUploadAttachmentFile';
import { type Attachment } from '@/activities/files/types/Attachment';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useUpdatePageLayoutWidget } from '@/page-layout/hooks/useUpdatePageLayoutWidget';
import { isPageLayoutInEditModeComponentState } from '@/page-layout/states/isPageLayoutInEditModeComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { BlockEditor } from '@/ui/input/editor/components/BlockEditor';
import { useAttachmentSync } from '@/ui/input/editor/hooks/useAttachmentSync';
import { parseInitialBlocknote } from '@/ui/input/editor/utils/parseInitialBlocknote';
import { prepareBodyWithSignedUrls } from '@/ui/input/editor/utils/prepareBodyWithSignedUrls';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import { useCreateBlockNote } from '@blocknote/react';
import '@blocknote/react/style.css';
import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared/utils';
import { useDebouncedCallback } from 'use-debounce';
import {
  PageLayoutType,
  type PageLayoutWidget,
  type StandaloneRichTextConfiguration,
} from '~/generated/graphql';

const StyledContainer = styled.div<{ isPageLayoutInEditMode?: boolean }>`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: hidden;
  padding-inline: ${({ theme, isPageLayoutInEditMode }) =>
    isPageLayoutInEditMode ? theme.spacing(5) : 0};
`;

type StandaloneRichTextWidgetProps = {
  widget: PageLayoutWidget;
};

export const StandaloneRichTextWidget = ({
  widget,
}: StandaloneRichTextWidgetProps) => {
  const isPageLayoutInEditMode = useRecoilComponentValue(
    isPageLayoutInEditModeComponentState,
  );

  const editingWidgetId = useRecoilComponentValue(
    pageLayoutEditingWidgetIdComponentState,
  );

  const { updatePageLayoutWidget } = useUpdatePageLayoutWidget();
  const { targetRecordIdentifier, layoutType } = useLayoutRenderingContext();
  const { uploadAttachmentFile } = useUploadAttachmentFile();

  const isDashboard = layoutType === PageLayoutType.DASHBOARD;
  const dashboardId = isDashboard ? targetRecordIdentifier?.id : undefined;

  const configuration = widget.configuration as
    | StandaloneRichTextConfiguration
    | undefined;

  const currentBody = configuration?.body?.blocknote ?? '';

  const { records: attachments } = useFindManyRecords<Attachment>({
    objectNameSingular: CoreObjectNameSingular.Attachment,
    filter: isDefined(dashboardId)
      ? { dashboardId: { eq: dashboardId } }
      : undefined,
    skip: !isDefined(dashboardId),
  });

  const { syncAttachments } = useAttachmentSync(attachments);

  const handleUploadAttachment = async (file: File) => {
    if (!isDefined(dashboardId)) return { attachmentAbsoluteURL: '' };

    return await uploadAttachmentFile(file, {
      id: dashboardId,
      targetObjectNameSingular: CoreObjectNameSingular.Dashboard,
    });
  };

  const handleEditorBuiltInUploadFile = async (file: File) => {
    const { attachmentAbsoluteURL } = await handleUploadAttachment(file);
    return attachmentAbsoluteURL;
  };

  const initialContent = useMemo(() => {
    if (isDefined(configuration) && 'body' in configuration) {
      return parseInitialBlocknote(configuration.body?.blocknote);
    }
    return undefined;
  }, [configuration]);

  const editor = useCreateBlockNote({
    initialContent,
    domAttributes: { editor: { class: 'editor' } },
    schema: BLOCK_SCHEMA,
    uploadFile: handleEditorBuiltInUploadFile,
  });

  const handlePersistBody = useDebouncedCallback((blocknote: string) => {
    updatePageLayoutWidget(widget.id, {
      configuration: {
        body: {
          blocknote,
          markdown: null,
        },
      },
    });
  }, 300);

  const handleAttachmentSync = useDebouncedCallback(
    async (newStringifiedBody: string, previousBody: string) => {
      await syncAttachments(newStringifiedBody, previousBody);
    },
    500,
  );

  const handleEditorChange = () => {
    const newStringifiedBody = JSON.stringify(editor.document) ?? '';
    const preparedBody = prepareBodyWithSignedUrls(newStringifiedBody);

    handlePersistBody(preparedBody);
    handleAttachmentSync(newStringifiedBody, currentBody);
  };

  const isThisWidgetBeingEdited = editingWidgetId === widget.id;
  const isEditable = isPageLayoutInEditMode && isThisWidgetBeingEdited;

  //TODO: this should be handled way earlier, because we should not be able to select this widget type record page layouts in the first place
  if (!isDefined(dashboardId)) {
    throw new Error(
      'StandaloneRichTextWidget should only be rendered on dashboards. This widget type should not be selectable on other layout types.',
    );
  }

  return (
    <StyledContainer isPageLayoutInEditMode={isPageLayoutInEditMode}>
      <ScrollWrapper
        componentInstanceId={`scroll-wrapper-rich-text-widget-${widget.id}`}
      >
        <BlockEditor
          onChange={handleEditorChange}
          editor={editor}
          readonly={!isEditable}
        />
      </ScrollWrapper>
    </StyledContainer>
  );
};
