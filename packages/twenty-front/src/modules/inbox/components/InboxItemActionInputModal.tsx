import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { Button } from 'twenty-ui/input';

import { type InboxItemAction } from '~/generated/graphql';

const StyledForm = styled.form`
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledLabel = styled.label`
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  flex-direction: column;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledInput = styled.input`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.primary};
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.md};
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledTextArea = styled.textarea`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.primary};
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.md};
  min-height: 72px;
  padding: ${themeCssVariables.spacing[2]};
  resize: vertical;
`;

const StyledButtons = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: flex-end;
`;

type InboxItemActionInputModalProps = {
  action: InboxItemAction;
  onSubmit: (input: Record<string, string>) => void | Promise<void>;
  onCancel: () => void;
};

// The type declares which fields an action collects, so this renders whatever
// it declares rather than knowing about feedback, answers or reasons.
export const InboxItemActionInputModal = ({
  action,
  onSubmit,
  onCancel,
}: InboxItemActionInputModalProps) => {
  const { t } = useLingui();
  // A checkbox is never blank, so a required BOOLEAN starts at false rather
  // than reading as missing until it is toggled twice
  const [input, setInput] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      action.inputSchema
        .filter((field) => field.type === 'BOOLEAN')
        .map((field) => [field.key, 'false']),
    ),
  );

  const isMissingRequiredField = action.inputSchema.some(
    (field) => field.isRequired && (input[field.key] ?? '') === '',
  );

  return (
    <StyledForm
      onSubmit={(event) => {
        event.preventDefault();
        void onSubmit(input);
      }}
    >
      {action.inputSchema.map((field) => (
        <StyledLabel key={field.key}>
          {field.label}
          {field.type === 'BOOLEAN' ? (
            <StyledInput
              checked={input[field.key] === 'true'}
              type="checkbox"
              onChange={(event) =>
                setInput((current) => ({
                  ...current,
                  [field.key]: String(event.target.checked),
                }))
              }
            />
          ) : field.type === 'LONG_TEXT' ? (
            <StyledTextArea
              value={input[field.key] ?? ''}
              onChange={(event) =>
                setInput((current) => ({
                  ...current,
                  [field.key]: event.target.value,
                }))
              }
            />
          ) : (
            <StyledInput
              type={field.type === 'NUMBER' ? 'number' : 'text'}
              value={input[field.key] ?? ''}
              onChange={(event) =>
                setInput((current) => ({
                  ...current,
                  [field.key]: event.target.value,
                }))
              }
            />
          )}
        </StyledLabel>
      ))}
      <StyledButtons>
        <Button
          onClick={onCancel}
          size="small"
          title={t`Cancel`}
          type="button"
          variant="secondary"
        />
        <Button
          accent="blue"
          disabled={isMissingRequiredField}
          size="small"
          title={action.label}
          type="submit"
          variant="primary"
        />
      </StyledButtons>
    </StyledForm>
  );
};
