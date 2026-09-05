import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useContext, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconMail } from 'twenty-ui/icon';
import { Checkbox } from 'twenty-ui/input';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { type InboxItemContextSource } from '@/inbox/types/InboxItemContext';
import { getInboxToolCallInputAsStrings } from '@/inbox/utils/getInboxToolCallInputAsStrings';
import { TextArea } from '@/ui/input/components/TextArea';
import { TextInput } from '@/ui/input/components/TextInput';
import {
  type InboxItemField,
  type InboxItemToolCall,
  InboxItemToolCallStatus,
} from '~/generated/graphql';

const StyledCard = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
`;

const StyledSource = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledSourceLabel = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledSourceDetail = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledSourceExcerpt = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledMessageCount = styled.span`
  align-self: flex-start;
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  margin-top: ${themeCssVariables.spacing[1]};
  padding: 2px ${themeCssVariables.spacing[2]};
`;

const StyledFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledFieldRow = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: 1fr 1fr;
`;

const StyledReadOnlyField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const StyledReadOnlyLabel = styled.span`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.xs};
  text-transform: uppercase;
`;

const StyledReadOnlyValue = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.md};
  white-space: pre-wrap;
`;

const StyledCheckboxField = styled.label`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  cursor: pointer;
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledStatus = styled.div<{ isFailure: boolean }>`
  color: ${({ isFailure }) =>
    isFailure ? themeCssVariables.color.red : themeCssVariables.color.green};
  font-size: ${themeCssVariables.font.size.sm};
  padding: 0 ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[3]};
`;

const EMAIL_TOOL_NAME = 'send_email';

type InboxPlanToolCallEditorProps = {
  toolCall: InboxItemToolCall;
  source?: InboxItemContextSource;
  onSave: (editedInput: Record<string, unknown>) => Promise<void>;
};

// A schema-driven form covers any tool; an email gets the composer treatment
// because that is what a person expects when they are about to send one.
export const InboxPlanToolCallEditor = ({
  toolCall,
  source,
  onSave,
}: InboxPlanToolCallEditorProps) => {
  const { t } = useLingui();
  const { theme } = useContext(ThemeContext);

  const [draft, setDraft] = useState<Record<string, string>>(() =>
    getInboxToolCallInputAsStrings(toolCall),
  );

  const isRejected = toolCall.status === InboxItemToolCallStatus.REJECTED;
  const hasRun =
    toolCall.status === InboxItemToolCallStatus.EXECUTED ||
    toolCall.status === InboxItemToolCallStatus.FAILED;

  // A schema from the producer wins; without one the proposal's own keys are
  // the form, as text.
  const fields: InboxItemField[] =
    toolCall.inputSchema.length > 0
      ? toolCall.inputSchema
      : Object.keys(draft).map((key) => ({
          key,
          label: key,
          type: 'TEXT',
          isRequired: false,
        }));

  const setFieldValue = (key: string, value: string) =>
    setDraft((current) => ({ ...current, [key]: value }));

  // Numbers and booleans go back as their own type and cleared fields are
  // dropped, so what runs is the same shape the agent proposed.
  const toInputValue = (field: InboxItemField, value: string) => {
    if (value === '') {
      return field.type === 'BOOLEAN' && field.isRequired ? false : undefined;
    }

    if (field.type === 'NUMBER') {
      return Number(value);
    }

    if (field.type === 'BOOLEAN') {
      return value === 'true';
    }

    return value;
  };

  const buildEditedInput = (currentDraft: Record<string, string>) =>
    Object.fromEntries(
      fields
        .map((field) => [
          field.key,
          toInputValue(field, currentDraft[field.key] ?? ''),
        ])
        .filter(([, value]) => isDefined(value)),
    );

  const save = () => void onSave(buildEditedInput(draft));

  const toggleBoolean = (field: InboxItemField, isChecked: boolean) => {
    const nextDraft = { ...draft, [field.key]: String(isChecked) };

    setDraft(nextDraft);
    void onSave(buildEditedInput(nextDraft));
  };

  const renderField = (field: InboxItemField) => {
    if (hasRun || isRejected) {
      return (
        <StyledReadOnlyField key={field.key}>
          <StyledReadOnlyLabel>{field.label}</StyledReadOnlyLabel>
          <StyledReadOnlyValue>{draft[field.key] ?? ''}</StyledReadOnlyValue>
        </StyledReadOnlyField>
      );
    }

    if (field.type === 'BOOLEAN') {
      return (
        <StyledCheckboxField key={field.key}>
          <Checkbox
            checked={draft[field.key] === 'true'}
            onCheckedChange={(isChecked) => toggleBoolean(field, isChecked)}
          />
          {field.isRequired ? `${field.label}*` : field.label}
        </StyledCheckboxField>
      );
    }

    if (field.type === 'LONG_TEXT') {
      return (
        <TextArea
          key={field.key}
          textAreaId={`inbox-plan-${toolCall.id}-${field.key}`}
          label={field.isRequired ? `${field.label}*` : field.label}
          minRows={toolCall.toolName === EMAIL_TOOL_NAME ? 8 : 3}
          value={draft[field.key] ?? ''}
          onChange={(value) => setFieldValue(field.key, value)}
          onBlur={save}
        />
      );
    }

    return (
      <TextInput
        key={field.key}
        label={field.label}
        type={field.type === 'NUMBER' ? 'number' : 'text'}
        value={draft[field.key] ?? ''}
        onChange={(value) => setFieldValue(field.key, value)}
        onBlur={save}
        required={field.isRequired}
        fullWidth
      />
    );
  };

  const isEmail = toolCall.toolName === EMAIL_TOOL_NAME;
  const shortFields = fields.filter((field) => field.type !== 'LONG_TEXT');
  const longFields = fields.filter((field) => field.type === 'LONG_TEXT');

  return (
    <StyledCard>
      {isEmail && isDefined(source) && source.kind === 'email' && (
        <StyledSource>
          <StyledSourceLabel>
            <IconMail size={theme.icon.size.md} />
            {source.label}
          </StyledSourceLabel>
          {isNonEmptyString(source.detail) && (
            <StyledSourceDetail>{source.detail}</StyledSourceDetail>
          )}
          {isNonEmptyString(source.excerpt) && (
            <StyledSourceExcerpt>{source.excerpt}</StyledSourceExcerpt>
          )}
          {isDefined(source.messageCount) && source.messageCount > 1 && (
            <StyledMessageCount>
              {t`${source.messageCount} emails`}
            </StyledMessageCount>
          )}
        </StyledSource>
      )}
      <StyledFields>
        {isEmail && shortFields.length > 1 ? (
          <>
            <StyledFieldRow>
              {shortFields.slice(0, 2).map(renderField)}
            </StyledFieldRow>
            {shortFields.slice(2).map(renderField)}
          </>
        ) : (
          shortFields.map(renderField)
        )}
        {longFields.map(renderField)}
      </StyledFields>
      {hasRun && (
        <StyledStatus
          isFailure={toolCall.status === InboxItemToolCallStatus.FAILED}
        >
          {toolCall.status === InboxItemToolCallStatus.FAILED
            ? (toolCall.error ?? t`This step failed`)
            : t`Done`}
        </StyledStatus>
      )}
    </StyledCard>
  );
};
