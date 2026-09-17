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
import { TextInput } from '@/ui/input/components/TextInput';

const StyledForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]};
`;

type AiChatChannelNameFormProps = {
  title: string;
  initialName?: string;
  submitLabel: string;
  onBack: () => void;
  onSubmit: (name: string) => Promise<void> | void;
  children?: React.ReactNode;
};

export const AiChatChannelNameForm = ({
  title,
  initialName = '',
  submitLabel,
  onBack,
  onSubmit,
  children,
}: AiChatChannelNameFormProps) => {
  const { t } = useLingui();
  const [name, setName] = useState(initialName);
  const trimmedName = name.trim();

  const handleSubmit = () => {
    if (trimmedName.length === 0) {
      return;
    }

    void onSubmit(trimmedName);
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
