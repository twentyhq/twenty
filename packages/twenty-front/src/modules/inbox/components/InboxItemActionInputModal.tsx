import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { Button, Checkbox } from 'twenty-ui/input';

import { TextArea } from '@/ui/input/components/TextArea';
import { TextInput } from '@/ui/input/components/TextInput';
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

const StyledCheckboxLabel = styled.label`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[2]};
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

  const [isSubmitting, setIsSubmitting] = useState(false);

  const setFieldValue = (key: string, value: string) =>
    setInput((current) => ({ ...current, [key]: value }));

  // A cleared optional field is omitted rather than sent as an empty string,
  // which a NUMBER field would reject
  const buildSubmittedInput = () =>
    Object.fromEntries(
      Object.entries(input).filter(([, value]) => value !== ''),
    );

  const handleSubmit = async () => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(buildSubmittedInput());
    } finally {
      setIsSubmitting(false);
    }
  };

  const isMissingRequiredField = action.inputSchema.some(
    (field) => field.isRequired && (input[field.key] ?? '') === '',
  );

  return (
    <StyledForm
      onSubmit={(event) => {
        event.preventDefault();
        void handleSubmit();
      }}
    >
      {action.inputSchema.map((field) =>
        field.type === 'BOOLEAN' ? (
          <StyledCheckboxLabel key={field.key}>
            <Checkbox
              checked={input[field.key] === 'true'}
              onCheckedChange={(value) =>
                setFieldValue(field.key, String(value))
              }
            />
            {field.label}
          </StyledCheckboxLabel>
        ) : field.type === 'LONG_TEXT' ? (
          <TextArea
            key={field.key}
            textAreaId={`inbox-item-action-${action.key}-${field.key}`}
            label={field.label}
            minRows={3}
            value={input[field.key] ?? ''}
            onChange={(value) => setFieldValue(field.key, value)}
          />
        ) : (
          <TextInput
            key={field.key}
            label={field.label}
            type={field.type === 'NUMBER' ? 'number' : 'text'}
            value={input[field.key] ?? ''}
            onChange={(value) => setFieldValue(field.key, value)}
            fullWidth
          />
        ),
      )}
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
          disabled={isMissingRequiredField || isSubmitting}
          size="small"
          title={action.label}
          type="submit"
          variant="primary"
        />
      </StyledButtons>
    </StyledForm>
  );
};
