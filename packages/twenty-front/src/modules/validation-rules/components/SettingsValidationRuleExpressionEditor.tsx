import { type Monaco } from '@monaco-editor/react';
import { type editor } from 'monaco-editor';
import { type ValidationRuleFieldDescriptor } from 'twenty-shared/types';
import { compileValidationRuleExpression } from 'twenty-shared/utils';
import { CodeEditor } from 'twenty-ui/components/code-editor';

import { VALIDATION_RULE_LANGUAGE_ID } from '@/validation-rules/constants/ValidationRuleLanguageId';
import {
  registerValidationRuleLanguage,
  setValidationRuleEditorFields,
  unsetValidationRuleEditorFields,
} from '@/validation-rules/utils/registerValidationRuleLanguage';

type SettingsValidationRuleExpressionEditorProps = {
  value: string;
  fields: ValidationRuleFieldDescriptor[];
  onChange: (value: string) => void;
};

export const SettingsValidationRuleExpressionEditor = ({
  value,
  fields,
  onChange,
}: SettingsValidationRuleExpressionEditorProps) => {
  const handleMount = (
    mountedEditor: editor.IStandaloneCodeEditor,
    monaco: Monaco,
  ) => {
    registerValidationRuleLanguage(monaco);

    const model = mountedEditor.getModel();

    if (model === null) {
      return;
    }

    monaco.editor.setModelLanguage(model, VALIDATION_RULE_LANGUAGE_ID);

    const modelUri = model.uri.toString();

    setValidationRuleEditorFields({ modelUri, fields });
    mountedEditor.onDidDispose(() => unsetValidationRuleEditorFields(modelUri));
  };

  const computeMarkers = (expression: string): editor.IMarkerData[] => {
    const compilationResult = compileValidationRuleExpression({
      expression,
      fields,
    });

    if (compilationResult.isValid) {
      return [];
    }

    const lines = expression.split('\n');

    return [
      {
        severity: 8,
        message: compilationResult.errorMessage,
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: lines.length,
        endColumn: (lines.at(-1)?.length ?? 0) + 1,
      },
    ];
  };

  return (
    <CodeEditor
      value={value}
      language={VALIDATION_RULE_LANGUAGE_ID}
      height={96}
      onMount={handleMount}
      onChange={onChange}
      setMarkers={computeMarkers}
      options={{
        lineNumbers: 'off',
        minimap: { enabled: false },
        wordWrap: 'on',
        scrollBeyondLastLine: false,
      }}
    />
  );
};
