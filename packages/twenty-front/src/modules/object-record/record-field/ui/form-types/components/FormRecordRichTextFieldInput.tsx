import { useCreateBlockNote } from '@blocknote/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useEffect, useId, useState } from 'react';
import { flushSync } from 'react-dom';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { LightIconButton, useToast } from 'twenty-ui/components';
import { IconMaximize } from 'twenty-ui/icon';
import { Field } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
import { useIsMobile } from 'twenty-ui/utilities';

import { BLOCK_SCHEMA } from '@/blocknote-editor/blocks/Schema';
import { BlockEditor } from '@/blocknote-editor/components/BlockEditor';
import { BLOCK_EDITOR_GLOBAL_HOTKEYS_CONFIG } from '@/blocknote-editor/constants/BlockEditorGlobalHotkeysConfig';
import { countBlocksDeep } from '@/blocknote-editor/utils/countBlocksDeep';
import { filterBlocksSupportedBySchema } from '@/blocknote-editor/utils/filterBlocksSupportedBySchema';
import { parseInitialBlocknote } from '@/blocknote-editor/utils/parseInitialBlocknote';
import { type FieldRichTextValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { FormFieldInputContainer } from '@/ui/input/components/FormFieldInputContainer';
import { useFullScreenModal } from '@/ui/layout/fullscreen/hooks/useFullScreenModal';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';

import '@blocknote/mantine/style.css';
import '@blocknote/react/style.css';

const StyledEditorContainer = styled.div`
  position: relative;
`;

const StyledExpandButtonContainer = styled.div`
  margin-top: ${themeCssVariables.spacing[1]};
  position: absolute;
  right: ${themeCssVariables.spacing[1]};
  top: ${themeCssVariables.spacing[0]};
  z-index: 1;
`;

const StyledFullScreenEditorContainer = styled.div`
  background-color: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[8]};
`;

type FormRecordRichTextFieldInputProps = {
  label?: string;
  defaultValue: FieldRichTextValue | undefined;
  onChange: (value: FieldRichTextValue) => void;
  readonly?: boolean;
  placeholder?: string;
};

export const FormRecordRichTextFieldInput = ({
  label,
  defaultValue,
  placeholder,
  onChange,
  readonly,
}: FormRecordRichTextFieldInputProps) => {
  const { t } = useLingui();

  const focusId = useId();

  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const { enqueueToast } = useToast();

  const isMobile = useIsMobile();
  const [isFullScreen, setIsFullScreen] = useState(false);

  const [{ initialBlocks, hasUnreadableStoredValue }] = useState(() => {
    const parsedBlocks = parseInitialBlocknote(
      defaultValue?.blocknote ?? defaultValue?.markdown,
    );

    const supportedBlocks = filterBlocksSupportedBySchema(
      parsedBlocks,
      BLOCK_SCHEMA.blockSchema,
    );

    return {
      initialBlocks: isNonEmptyArray(supportedBlocks)
        ? supportedBlocks
        : undefined,
      hasUnreadableStoredValue:
        countBlocksDeep(supportedBlocks) < countBlocksDeep(parsedBlocks),
    };
  });

  const handleUploadFile = async (): Promise<string> => {
    enqueueToast({
      variant: 'error',
      children: t`Save the record before attaching a file`,
    });

    return '';
  };

  const editor = useCreateBlockNote({
    uploadFile: handleUploadFile,
    initialContent: initialBlocks,
    domAttributes: { editor: { class: 'editor' } },
    schema: BLOCK_SCHEMA,
    placeholders: {
      default: placeholder ?? t`Type '/' for commands`,
    },
  });

  const handleChange = () => {
    onChange({
      blocknote: JSON.stringify(editor.document),
      markdown: null,
    });
  };

  const handleFocus = () => {
    pushFocusItemToFocusStack({
      component: {
        instanceId: focusId,
        type: FocusComponentType.ACTIVITY_RICH_TEXT_EDITOR,
      },
      focusId,
      globalHotkeysConfig: BLOCK_EDITOR_GLOBAL_HOTKEYS_CONFIG,
    });
  };

  const handleBlur = () => {
    removeFocusItemFromFocusStackById({ focusId });
  };

  useEffect(() => {
    return () => {
      removeFocusItemFromFocusStackById({ focusId });
    };
  }, [focusId, removeFocusItemFromFocusStackById]);

  useEffect(() => {
    if (hasUnreadableStoredValue) {
      enqueueToast({
        variant: 'error',
        children: t`This content was saved in an older format and cannot be edited here`,
      });
    }
  }, [hasUnreadableStoredValue, enqueueToast, t]);

  const handleFullScreenChange = (isFullScreenOpen: boolean) => {
    flushSync(() => {
      setIsFullScreen(isFullScreenOpen);
    });
    editor.focus();
  };

  const { renderFullScreenModal } = useFullScreenModal({
    links: [{ children: t`Text Editor` }],
    onClose: () => handleFullScreenChange(false),
  });

  const isReadonly = readonly || hasUnreadableStoredValue;

  return (
    <>
      <FormFieldInputContainer>
        {label ? <Field.Label>{label}</Field.Label> : null}
        {!isFullScreen && (
          <StyledEditorContainer>
            <BlockEditor
              editor={editor}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              readonly={isReadonly}
              isCompact
            />
            {!isReadonly && !isMobile && (
              <StyledExpandButtonContainer>
                <LightIconButton
                  size="sm"
                  onClick={() => handleFullScreenChange(true)}
                  emphasis="subtle"
                  aria-label={t`Expand to full screen`}
                >
                  <IconMaximize />
                </LightIconButton>
              </StyledExpandButtonContainer>
            )}
          </StyledEditorContainer>
        )}
      </FormFieldInputContainer>
      {renderFullScreenModal(
        <StyledFullScreenEditorContainer>
          <BlockEditor
            editor={editor}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            readonly={isReadonly}
          />
        </StyledFullScreenEditorContainer>,
        isFullScreen,
      )}
    </>
  );
};
