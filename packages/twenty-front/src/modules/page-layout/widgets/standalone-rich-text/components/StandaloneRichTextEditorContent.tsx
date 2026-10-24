import { useCallback, useState } from 'react';

import { AdvancedTextEditor } from '@/advanced-text-editor/components/AdvancedTextEditor';
import { AdvancedTextEditorBlockHandle } from '@/advanced-text-editor/components/AdvancedTextEditorBlockHandle';
import { useAdvancedTextEditor } from '@/advanced-text-editor/hooks/useAdvancedTextEditor';
import { getStorableEditorDocument } from '@/advanced-text-editor/utils/getStorableEditorDocument';
import { serializeJsonContentAsAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/serializeJsonContentAsAdvancedTextEditorDocument';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { RICH_TEXT_FIELD_EDITOR_GLOBAL_HOTKEYS_CONFIG } from '@/object-record/record-field/ui/meta-types/input/constants/RichTextFieldEditorGlobalHotkeysConfig';
import { useUpdatePageLayoutWidget } from '@/page-layout/hooks/useUpdatePageLayoutWidget';
import { isDashboardInEditModeComponentState } from '@/page-layout/states/isDashboardInEditModeComponentState';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { StandaloneRichTextWidgetAutoFocusEffect } from '@/page-layout/widgets/standalone-rich-text/components/StandaloneRichTextWidgetAutoFocusEffect';
import { STANDALONE_RICH_TEXT_EDITOR_PROFILE } from '@/page-layout/widgets/standalone-rich-text/constants/StandaloneRichTextEditorProfile';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { type Editor } from '@tiptap/core';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';
import { useDebouncedCallback } from 'use-debounce';
import { WidgetConfigurationType } from '~/generated-metadata/graphql';

const StyledEditorContainer = styled.div<{ isEditable: boolean }>`
  box-sizing: border-box;
  max-width: 100%;
  min-width: 0;
  padding-left: ${({ isEditable }) =>
    isEditable ? themeCssVariables.spacing[5] : 0};
  position: relative;
  width: 100%;
`;

type StandaloneRichTextEditorContentProps = {
  widget: PageLayoutWidget;
  currentBody: string | undefined;
  isEditable: boolean;
  shouldFocus: boolean;
  containerElement: HTMLDivElement | null;
};

export const StandaloneRichTextEditorContent = ({
  widget,
  currentBody,
  isEditable,
  shouldFocus,
  containerElement,
}: StandaloneRichTextEditorContentProps) => {
  const { updatePageLayoutWidget } = useUpdatePageLayoutWidget();
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();
  const isDashboardInEditModeState = useAtomComponentStateCallbackState(
    isDashboardInEditModeComponentState,
  );
  const store = useStore();

  const [initialBody] = useState(currentBody);

  const shouldPersistDraft = useCallback(() => {
    const isDashboardInEditMode = store.get(isDashboardInEditModeState);
    const isLayoutCustomizationModeEnabled = store.get(
      isLayoutCustomizationModeEnabledState.atom,
    );
    return (
      isEditable && (isDashboardInEditMode || isLayoutCustomizationModeEnabled)
    );
  }, [isDashboardInEditModeState, isEditable, store]);

  const handlePersistBody = useDebouncedCallback((tiptap: string) => {
    if (!shouldPersistDraft()) {
      return;
    }
    updatePageLayoutWidget(widget.id, {
      configuration: {
        configurationType: WidgetConfigurationType.STANDALONE_RICH_TEXT,
        body: {
          blocknote: null,
          markdown: null,
          tiptap,
        },
      },
    });
  }, 300);

  const handleEditorUpdate = (currentEditor: Editor) => {
    handlePersistBody(
      serializeJsonContentAsAdvancedTextEditorDocument(
        getStorableEditorDocument(currentEditor),
      ),
    );
  };

  const handleEditorFocus = () => {
    pushFocusItemToFocusStack({
      component: {
        instanceId: widget.id,
        type: FocusComponentType.STANDALONE_RICH_TEXT_WIDGET,
      },
      focusId: widget.id,
      globalHotkeysConfig: RICH_TEXT_FIELD_EDITOR_GLOBAL_HOTKEYS_CONFIG,
    });
  };

  const handleEditorBlur = () => {
    handlePersistBody.flush();
    removeFocusItemFromFocusStackById({
      focusId: widget.id,
    });
  };

  const editor = useAdvancedTextEditor(
    {
      profile: STANDALONE_RICH_TEXT_EDITOR_PROFILE,
      placeholder: t`Enter text or type '/' for commands`,
      readonly: !isEditable,
      defaultValue: initialBody,
      onUpdate: handleEditorUpdate,
      onFocus: handleEditorFocus,
      onBlur: handleEditorBlur,
    },
    [widget.id, isEditable],
  );

  if (!isDefined(editor)) {
    return null;
  }

  return (
    <StyledEditorContainer isEditable={isEditable}>
      <StandaloneRichTextWidgetAutoFocusEffect
        shouldFocus={shouldFocus}
        editor={editor}
        containerElement={containerElement}
      />
      <AdvancedTextEditor
        editor={editor}
        readonly={!isEditable}
        minHeight={STANDALONE_RICH_TEXT_EDITOR_PROFILE.minHeight}
        variant={STANDALONE_RICH_TEXT_EDITOR_PROFILE.variant}
      />
      {isEditable && <AdvancedTextEditorBlockHandle editor={editor} />}
    </StyledEditorContainer>
  );
};
