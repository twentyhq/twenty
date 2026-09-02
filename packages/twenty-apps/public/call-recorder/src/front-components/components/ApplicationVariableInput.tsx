import { StyledSettingsSelect } from 'src/front-components/components/StyledSettingsSelect';
import { StyledSettingsTextArea } from 'src/front-components/components/StyledSettingsTextArea';
import { StyledSettingsTextInput } from 'src/front-components/components/StyledSettingsTextInput';
import { type CallRecorderApplicationVariable } from 'src/front-components/types/call-recorder-application-variable.type';
import { serializeRichTextMarkdown } from 'src/front-components/utils/serialize-rich-text-markdown.util';
import { EMPTY_OPTION_LABEL } from 'src/front-components/constants/empty-option-label.constant';
import { extractRichTextMarkdown } from 'src/logic-functions/utils/extract-rich-text-markdown.util';

type ApplicationVariableInputProps = {
  inputId: string;
  variable: CallRecorderApplicationVariable;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
};

export const ApplicationVariableInput = ({
  inputId,
  variable,
  value,
  placeholder,
  onChange,
}: ApplicationVariableInputProps) => {
  switch (variable.type) {
    case 'BOOLEAN':
      return (
        <StyledSettingsSelect
          id={inputId}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="">{EMPTY_OPTION_LABEL}</option>
          <option value="true">True</option>
          <option value="false">False</option>
        </StyledSettingsSelect>
      );

    case 'SELECT':
      return (
        <StyledSettingsSelect
          id={inputId}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="">{EMPTY_OPTION_LABEL}</option>
          {(variable.options ?? []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </StyledSettingsSelect>
      );

    case 'RICH_TEXT':
      return (
        <StyledSettingsTextArea
          id={inputId}
          placeholder={placeholder ?? 'Value'}
          value={extractRichTextMarkdown(value) ?? ''}
          onChange={(event) =>
            onChange(serializeRichTextMarkdown(event.target.value))
          }
        />
      );

    case 'NUMBER':
    case 'NUMERIC':
      return (
        <StyledSettingsTextInput
          id={inputId}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          placeholder={placeholder ?? 'Enter a number'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      );

    default:
      return (
        <StyledSettingsTextInput
          id={inputId}
          type={variable.isSecret ? 'password' : 'text'}
          autoComplete="off"
          placeholder={placeholder ?? 'Value'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      );
  }
};
