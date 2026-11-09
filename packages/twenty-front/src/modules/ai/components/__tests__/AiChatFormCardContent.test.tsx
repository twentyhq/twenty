import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FieldMetadataType } from 'twenty-shared/types';

import { AiChatFormCardContent } from '@/ai/components/AiChatFormCardContent';

const renderFormCard = ({
  isSubmitDisabled = false,
}: { isSubmitDisabled?: boolean } = {}) => {
  const onSubmit = jest.fn();
  const onSkip = jest.fn();

  render(
    <I18nProvider i18n={i18n}>
      <AiChatFormCardContent
        fields={[
          {
            name: 'count',
            label: 'How many agencies should I find?',
            type: FieldMetadataType.NUMBER,
          },
        ]}
        isSubmitDisabled={isSubmitDisabled}
        onFieldChange={jest.fn()}
        onError={jest.fn()}
        onSubmit={onSubmit}
        onSkip={onSkip}
      />
    </I18nProvider>,
  );

  return { onSubmit, onSkip };
};

describe('AiChatFormCardContent', () => {
  it('should submit when pressing Enter in a field', async () => {
    const { onSubmit, onSkip } = renderFormCard();

    await userEvent.type(screen.getByRole('textbox'), '100{Enter}');

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSkip).not.toHaveBeenCalled();
  });

  it('should not submit on Enter while submit is disabled', async () => {
    const { onSubmit } = renderFormCard({ isSubmitDisabled: true });

    await userEvent.type(screen.getByRole('textbox'), '100{Enter}');

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should submit once when clicking the submit button', async () => {
    const { onSubmit } = renderFormCard();

    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
