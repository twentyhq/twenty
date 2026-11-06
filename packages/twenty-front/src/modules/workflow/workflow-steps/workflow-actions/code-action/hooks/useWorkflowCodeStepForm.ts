import { type WorkflowCodeAction } from '@/workflow/types/Workflow';
import { mergeDefaultFunctionInputAndFunctionInput } from '@/workflow/workflow-steps/workflow-actions/code-action/utils/mergeDefaultFunctionInputAndFunctionInput';
import { setNestedValue } from '@/workflow/workflow-steps/workflow-actions/code-action/utils/setNestedValue';
import { useRef, useState } from 'react';
import {
  getInputSchemaFromSourceCode,
  jsonSchemaToInputSchema,
} from 'twenty-shared/logic-function';
import { isDefined } from 'twenty-shared/utils';
import { getFunctionInputFromInputSchema } from 'twenty-shared/workflow';
import { useDebouncedCallback } from 'use-debounce';

type LogicFunctionInputFormData = {
  [field: string]: string | LogicFunctionInputFormData;
};

type WorkflowCodeStepSettingsUpdate = Pick<
  WorkflowCodeAction['settings'],
  'expectedOutputSchema' | 'outputSchema'
>;

type UseWorkflowCodeStepFormProps = {
  action: WorkflowCodeAction;
  savedCode: string | undefined;
  onActionUpdate?: (action: WorkflowCodeAction) => void;
  onFunctionInputInferred: (
    inferredFunctionInput: LogicFunctionInputFormData,
  ) => void;
};

export const useWorkflowCodeStepForm = ({
  action,
  savedCode,
  onActionUpdate,
  onFunctionInputInferred,
}: UseWorkflowCodeStepFormProps) => {
  const [editedCode, setEditedCode] = useState<string>();

  const code = editedCode ?? savedCode;

  const [functionInput, setFunctionInput] =
    useState<LogicFunctionInputFormData>(
      action.settings.input.logicFunctionInput ?? {},
    );

  // Every save is built from these at flush time, so a delayed save never writes back an older snapshot
  // oxlint-disable-next-line twenty/no-state-useref
  const latestActionRef = useRef(action);
  latestActionRef.current = action;

  // oxlint-disable-next-line twenty/no-state-useref
  const latestCodeRef = useRef(code);
  latestCodeRef.current = code;

  // oxlint-disable-next-line twenty/no-state-useref
  const latestFunctionInputRef = useRef(functionInput);

  // oxlint-disable-next-line twenty/no-state-useref
  const pendingSettingsRef = useRef<Partial<WorkflowCodeStepSettingsUpdate>>(
    {},
  );

  // Read after an await, so it must not be a render-time snapshot
  // oxlint-disable-next-line twenty/no-state-useref
  const codeEditGenerationRef = useRef(0);

  const saveAction = useDebouncedCallback(() => {
    if (!isDefined(onActionUpdate)) {
      return;
    }

    const latestAction = latestActionRef.current;
    const latestCode = latestCodeRef.current;
    const pendingSettings = pendingSettingsRef.current;

    pendingSettingsRef.current = {};

    onActionUpdate({
      ...latestAction,
      settings: {
        ...latestAction.settings,
        ...pendingSettings,
        // keeps a legacy logicFunctionId so the 2.57 upgrade still finds and deletes that function
        input: {
          ...latestAction.settings.input,
          ...(isDefined(latestCode) ? { code: latestCode } : {}),
          logicFunctionInput: latestFunctionInputRef.current,
        },
      },
    });
  }, 500);

  const updateFunctionInput = (
    updatedFunctionInput: LogicFunctionInputFormData,
  ) => {
    latestFunctionInputRef.current = updatedFunctionInput;
    setFunctionInput(updatedFunctionInput);
  };

  const inferFunctionInput = useDebouncedCallback(async (newCode: string) => {
    const codeEditGeneration = codeEditGenerationRef.current;

    // Not per keystroke: concurrent dynamic imports resolve out of order
    const inferredJsonSchema = await getInputSchemaFromSourceCode(newCode);

    if (codeEditGeneration !== codeEditGenerationRef.current) {
      return;
    }

    const inferredFunctionInput = getFunctionInputFromInputSchema(
      jsonSchemaToInputSchema(inferredJsonSchema),
    )[0];

    updateFunctionInput(
      mergeDefaultFunctionInputAndFunctionInput({
        newInput: inferredFunctionInput,
        oldInput: latestFunctionInputRef.current,
      }),
    );

    onFunctionInputInferred(inferredFunctionInput);

    saveAction();
    saveAction.flush();
  }, 500);

  const handleCodeChange = (newCode: string) => {
    if (!isDefined(onActionUpdate)) {
      return;
    }

    codeEditGenerationRef.current += 1;
    latestCodeRef.current = newCode;
    setEditedCode(newCode);
    inferFunctionInput(newCode);
  };

  const handleFunctionInputChange = (value: unknown, path: string[]) => {
    updateFunctionInput(
      setNestedValue(latestFunctionInputRef.current, path, value),
    );
    saveAction();
  };

  const saveSettings = (
    settingsUpdate: Partial<WorkflowCodeStepSettingsUpdate>,
  ) => {
    pendingSettingsRef.current = {
      ...pendingSettingsRef.current,
      ...settingsUpdate,
    };
    saveAction();
  };

  const getCodeEditGeneration = () => codeEditGenerationRef.current;

  return {
    code,
    functionInput,
    handleCodeChange,
    handleFunctionInputChange,
    saveSettings,
    getCodeEditGeneration,
  };
};
