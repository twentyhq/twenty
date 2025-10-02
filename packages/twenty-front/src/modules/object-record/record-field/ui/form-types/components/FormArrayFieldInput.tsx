import styled from '@emotion/styled';

import { FormFieldInputContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputContainer';
import { FormFieldInputInnerContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputInnerContainer';
import { FormFieldInputRowContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputRowContainer';
import { FormFieldPlaceholder } from '@/object-record/record-field/ui/form-types/components/FormFieldPlaceholder';
import { TextVariableEditor } from '@/object-record/record-field/ui/form-types/components/TextVariableEditor';
import { VariableChipStandalone } from '@/object-record/record-field/ui/form-types/components/VariableChipStandalone';
import { type VariablePickerComponent } from '@/object-record/record-field/ui/form-types/types/VariablePickerComponent';
import { type FieldArrayValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { isStandaloneVariableString } from '@/workflow/utils/isStandaloneVariableString';
import { parseEditorContent } from '@/workflow/workflow-variables/utils/parseEditorContent';
import { useTheme } from '@emotion/react';
import { isArray } from '@sniptt/guards';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { Placeholder } from '@tiptap/extensions';
import { useEditor } from '@tiptap/react';
import { useId, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { VisibilityHidden } from 'twenty-ui/accessibility';

type FormArrayFieldInputProps = {
  label?: string;
  defaultValue: FieldArrayValue | string | undefined;
  onChange: (value: FieldArrayValue | string) => void;
  VariablePicker?: VariablePickerComponent;
  readonly?: boolean;
  placeholder?: string;
  testId?: string;
};

const StyledDisplayModeReadonlyContainer = styled.div`
  align-items: center;
  background: transparent;
  border: none;
  display: flex;
  font-family: inherit;
  padding-inline: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

const StyledDisplayModeContainer = styled(StyledDisplayModeReadonlyContainer)`
  cursor: pointer;

  &:hover,
  &[data-open='true'] {
    background-color: ${({ theme }) => theme.background.transparent.lighter};
  }
`;

const StyledSelectInputContainer = styled.div`
  position: absolute;
  z-index: 1;
  top: ${({ theme }) => theme.spacing(9)};
`;

const StyledPlaceholder = styled(FormFieldPlaceholder)`
  width: 100%;
`;

const safeParsedValue = (value: string) => {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

export const FormArrayFieldInput = ({
  label,
  defaultValue,
  onChange,
  VariablePicker,
  readonly,
  placeholder,
  testId,
}: FormArrayFieldInputProps) => {
  const instanceId = useId();
  const theme = useTheme();

  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const [draftValue, setDraftValue] = useState<
    | {
        type: 'static';
        value: FieldArrayValue;
        editingMode: 'view' | 'edit';
      }
    | {
        type: 'variable';
        value: string;
      }
  >(
    isStandaloneVariableString(defaultValue)
      ? {
          type: 'variable',
          value: defaultValue,
        }
      : {
          type: 'static',
          value: isDefined(defaultValue) ? defaultValue : [],
          editingMode: 'view',
        },
  );

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Placeholder.configure({
        placeholder: placeholder ?? 'Enter first item',
      }),
    ],
    content: draftValue.type === 'static' ? draftValue.value[0] : '',
    editorProps: {
      handleKeyDown: (_view, event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
          console.log('save and open popup');

          return false;
        }
      },
    },
    onUpdate: ({ editor }) => {
      const jsonContent = editor.getJSON();
      const parsedContent = parseEditorContent(jsonContent);

      onChange([parsedContent]);
    },
  });

  const handleDisplayModeClick = () => {
    if (draftValue.type !== 'static') {
      throw new Error(
        'This function can only be called when editing a static value.',
      );
    }

    setDraftValue({
      ...draftValue,
      editingMode: 'edit',
    });

    pushFocusItemToFocusStack({
      focusId: instanceId,
      component: {
        type: FocusComponentType.FORM_FIELD_INPUT,
        instanceId,
      },
      globalHotkeysConfig: {
        enableGlobalHotkeysConflictingWithKeyboard: false,
      },
    });
  };

  const onOptionSelected = (value: FieldArrayValue) => {
    if (draftValue.type !== 'static') {
      throw new Error('Can only be called when editing a static value');
    }

    setDraftValue({
      type: 'static',
      value,
      editingMode: 'edit',
    });

    onChange(value);
  };

  const onCancel = () => {
    if (draftValue.type !== 'static') {
      throw new Error('Can only be called when editing a static value');
    }

    setDraftValue({
      ...draftValue,
      editingMode: 'view',
    });

    removeFocusItemFromFocusStackById({ focusId: instanceId });
  };

  const handleVariableTagInsert = (variableName: string) => {
    setDraftValue({
      type: 'variable',
      value: variableName,
    });

    onChange(variableName);
  };

  const handleUnlinkVariable = () => {
    setDraftValue({
      type: 'static',
      value: [],
      editingMode: 'view',
    });

    onChange([]);
  };

  const selectedNames =
    draftValue.type === 'static' && isDefined(draftValue.value)
      ? isArray(draftValue.value)
        ? draftValue.value
        : safeParsedValue(draftValue.value)
      : undefined;

  const placeholderText = placeholder ?? label;

  return (
    <FormFieldInputContainer data-testid={testId}>
      {label ? <InputLabel>{label}</InputLabel> : null}

      <FormFieldInputRowContainer>
        <FormFieldInputInnerContainer
          formFieldInputInstanceId={instanceId}
          hasRightElement={isDefined(VariablePicker) && !readonly}
        >
          {draftValue.type === 'static' ? (
            readonly ? null : (
              // <StyledDisplayModeContainer
              //   data-open={draftValue.editingMode === 'edit'}
              //   onClick={handleDisplayModeClick}
              // >
              //   <VisibilityHidden>Edit</VisibilityHidden>

              //   <TextVariableEditor
              //     editor={editor}
              //     multiline={false}
              //     readonly={readonly}
              //   />
              // </StyledDisplayModeContainer>
              <>
                <VisibilityHidden>Edit</VisibilityHidden>

                <TextVariableEditor
                  editor={editor}
                  multiline={false}
                  readonly={readonly}
                />
              </>
            )
          ) : (
            <VariableChipStandalone
              rawVariableName={draftValue.value}
              onRemove={readonly ? undefined : handleUnlinkVariable}
            />
          )}
        </FormFieldInputInnerContainer>
        {/* <StyledSelectInputContainer>
          {draftValue.type === 'static' &&
            draftValue.editingMode === 'edit' && (
              <OverlayContainer>
                <MultiSelectInput
                  selectableListComponentInstanceId={
                    SELECT_FIELD_INPUT_SELECTABLE_LIST_COMPONENT_INSTANCE_ID
                  }
                  focusId={instanceId}
                  options={options}
                  onCancel={onCancel}
                  onOptionSelected={onOptionSelected}
                  values={selectedNames}
                  dropdownWidth={GenericDropdownContentWidth.ExtraLarge}
                />
              </OverlayContainer>
            )}
        </StyledSelectInputContainer> */}

        {VariablePicker && !readonly && (
          <VariablePicker
            instanceId={instanceId}
            onVariableSelect={handleVariableTagInsert}
          />
        )}
      </FormFieldInputRowContainer>
    </FormFieldInputContainer>
  );
};
