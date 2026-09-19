import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { Key } from 'ts-key-enum';
import { IconChevronLeft } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { TextArea } from '@/ui/input/components/TextArea';
import { TextInput } from '@/ui/input/components/TextInput';

const StyledForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]};
`;

export type AiChatChannelFormValues = {
  name: string;
  description: string | null;
};

type AiChatChannelFormProps = {
  title: string;
  initialName?: string;
  initialDescription?: string | null;
  submitLabel: string;
  onBack: () => void;
  onSubmit: (values: AiChatChannelFormValues) => Promise<void> | void;
  children?: React.ReactNode;
};

export const AiChatChannelForm = ({
  title,
  initialName = '',
  initialDescription = null,
  submitLabel,
  onBack,
  onSubmit,
  children,
}: AiChatChannelFormProps) => {
  const { t } = useLingui();
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription ?? '');
  const trimmedName = name.trim();
  const trimmedDescription = description.trim();

  const handleSubmit = () => {
    if (trimmedName.length === 0) {
      return;
    }

    void onSubmit({
      name: trimmedName,
      description: trimmedDescription.length > 0 ? trimmedDescription : null,
    });
  };

  return (
    <DropdownContent>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            onClick={onBack}
            Icon={IconChevronLeft}
          />
        }
      >
        {title}
      </DropdownMenuHeader>
      <StyledForm>
        <TextInput
          value={name}
          onChange={setName}
          placeholder={t`Channel name`}
          onKeyDown={(event) => {
            if (event.key === Key.Enter) {
              event.preventDefault();
              handleSubmit();
            }
          }}
          fullWidth
          autoFocus
        />
        <TextArea
          textAreaId="ai-chat-channel-description"
          value={description}
          onChange={setDescription}
          placeholder={t`What is this channel for? (optional)`}
          minRows={2}
          maxRows={4}
        />
        {children}
        <Button
          title={submitLabel}
          variant="solid"
          color="accent"
          size="sm"
          disabled={trimmedName.length === 0}
          onClick={handleSubmit}
        >
          {submitLabel}
        </Button>
      </StyledForm>
    </DropdownContent>
  );
};
