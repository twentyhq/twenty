import { useQuery } from '@apollo/client/react';
import { FormRawJsonFieldInput } from '@/object-record/record-field/ui/form-types/components/FormRawJsonFieldInput';
import { parseAndValidateVariableFriendlyStringifiedJson } from '@/workflow/utils/parseAndValidateVariableFriendlyStringifiedJson';
import { WorkflowEditActionCodeFieldLeaf } from '@/workflow/workflow-steps/workflow-actions/code-action/components/WorkflowEditActionCodeFieldLeaf';
import { type ToolArgumentField } from '@/workflow/workflow-steps/workflow-actions/send-chat-message-action/types/ToolArgumentField';
import { buildToolArgumentFields } from '@/workflow/workflow-steps/workflow-actions/send-chat-message-action/utils/buildToolArgumentFields';
import { isEmptyToolArgument } from '@/workflow/workflow-steps/workflow-actions/send-chat-message-action/utils/isEmptyToolArgument';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useMemo, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { isStandaloneVariableString } from 'twenty-shared/workflow';
import { LightButton } from 'twenty-ui/components';
import { themeCssVariables } from 'twenty-ui/theme';
import { GetToolInputSchemaDocument } from '~/generated-metadata/graphql';

const StyledArguments = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledArgument = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledHint = styled.span`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledError = styled.span`
  color: ${themeCssVariables.font.color.danger};
  font-size: ${themeCssVariables.font.size.sm};
`;

type ToolArguments = Record<string, unknown>;

type WorkflowSendChatMessageToolArgumentsProps = {
  toolName: string;
  toolArguments: ToolArguments;
  readonly?: boolean;
  onChange: (toolArguments: ToolArguments) => void;
};

export const WorkflowSendChatMessageToolArguments = ({
  toolName,
  toolArguments,
  readonly,
  onChange,
}: WorkflowSendChatMessageToolArgumentsProps) => {
  const { data, loading } = useQuery(GetToolInputSchemaDocument, {
    variables: { toolName },
  });
  const fields = useMemo(
    () =>
      buildToolArgumentFields({
        jsonSchema: data?.getToolInputSchema,
        savedArgumentNames: Object.keys(toolArguments),
      }),
    [data, toolArguments],
  );
  const [isShowingOptionalArguments, setIsShowingOptionalArguments] =
    useState(false);
  const [jsonErrors, setJsonErrors] = useState<Record<string, string>>({});
  // an optional argument stays shown once it has a value, even while it is cleared to be edited
  const [revealedNames, setRevealedNames] = useState(
    () => new Set(Object.keys(toolArguments)),
  );

  if (loading) {
    return null;
  }

  // an empty value is left out, so an update never clears a field nobody filled in
  const handleArgumentChange = (name: string, value: unknown) => {
    const { [name]: _previousValue, ...otherArguments } = toolArguments;

    if (!isEmptyToolArgument(value) && !revealedNames.has(name)) {
      setRevealedNames(new Set([...revealedNames, name]));
    }

    onChange(
      isEmptyToolArgument(value)
        ? otherArguments
        : { ...otherArguments, [name]: value },
    );
  };

  const setJsonError = (key: string, error: string | undefined) =>
    setJsonErrors(({ [key]: _previousError, ...otherErrors }) =>
      isDefined(error) ? { ...otherErrors, [key]: error } : otherErrors,
    );

  if (!isDefined(fields)) {
    return (
      <FormRawJsonFieldInput
        label={t`Action arguments`}
        placeholder={t`Enter the arguments as a JSON object`}
        defaultValue={JSON.stringify(toolArguments, null, 2)}
        onChange={(value) => {
          const parsedArguments =
            parseAndValidateVariableFriendlyStringifiedJson(
              isNonEmptyString(value) ? value : '{}',
            );

          if (!parsedArguments.isValid) {
            setJsonError('', t`Arguments must be a valid JSON object.`);

            return;
          }

          setJsonError('', undefined);
          onChange(parsedArguments.data);
        }}
        error={jsonErrors['']}
        readonly={readonly}
        VariablePicker={WorkflowVariablePicker}
      />
    );
  }

  const handleJsonArgumentChange = (name: string, value: string | null) => {
    if (!isNonEmptyString(value) || isStandaloneVariableString(value)) {
      setJsonError(name, undefined);
      handleArgumentChange(name, value);

      return;
    }

    try {
      handleArgumentChange(name, JSON.parse(value));
      setJsonError(name, undefined);
    } catch {
      setJsonError(name, t`Enter valid JSON.`);
    }
  };

  const isShown = (field: ToolArgumentField) =>
    field.isRequired ||
    !field.isListed ||
    isShowingOptionalArguments ||
    revealedNames.has(field.name);
  const hiddenOptionalCount = fields.filter((field) => !isShown(field)).length;

  return (
    <StyledArguments>
      {fields.filter(isShown).map((field) => {
        const value = toolArguments[field.name];
        const label = field.isRequired ? `${field.label} *` : field.label;
        const isMissing = field.isRequired && isEmptyToolArgument(value);

        return (
          <StyledArgument key={field.name}>
            {isDefined(field.schemaProperty) ? (
              <WorkflowEditActionCodeFieldLeaf
                label={label}
                inputValue={value}
                schemaProperty={field.schemaProperty}
                readonly={readonly}
                onChange={(nextValue) =>
                  handleArgumentChange(field.name, nextValue)
                }
                VariablePicker={WorkflowVariablePicker}
              />
            ) : (
              <FormRawJsonFieldInput
                label={label}
                placeholder={t`Enter a JSON value`}
                defaultValue={
                  isDefined(value) ? JSON.stringify(value, null, 2) : undefined
                }
                onChange={(nextValue) =>
                  handleJsonArgumentChange(field.name, nextValue)
                }
                error={jsonErrors[field.name]}
                readonly={readonly}
                VariablePicker={WorkflowVariablePicker}
              />
            )}
            {isDefined(field.description) && (
              <StyledHint>{field.description}</StyledHint>
            )}
            {!field.isListed && (
              <StyledHint>
                {t`This action no longer takes this argument. Clear it to remove it.`}
              </StyledHint>
            )}
            {isMissing && !readonly && (
              <StyledError>{t`Required to run the action`}</StyledError>
            )}
          </StyledArgument>
        );
      })}
      {!readonly && (hiddenOptionalCount > 0 || isShowingOptionalArguments) && (
        <LightButton
          emphasis="subtle"
          onClick={() =>
            setIsShowingOptionalArguments(
              (isShowingOptional) => !isShowingOptional,
            )
          }
        >
          {isShowingOptionalArguments
            ? t`Hide empty optional arguments`
            : t`Show ${hiddenOptionalCount} optional arguments`}
        </LightButton>
      )}
    </StyledArguments>
  );
};
