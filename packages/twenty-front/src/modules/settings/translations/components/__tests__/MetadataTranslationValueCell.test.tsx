import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { MetadataTranslationValueCell } from '@/settings/translations/components/MetadataTranslationValueCell';
import { type MetadataTranslationRow } from '@/settings/translations/hooks/useMetadataTranslations';
import { MetadataTranslationProvenance } from '~/generated-metadata/graphql';

const translatedRow: MetadataTranslationRow = {
  metadataName: 'objectMetadata',
  recordId: 'object-metadata-id',
  objectMetadataId: null,
  property: 'labelPlural',
  locale: 'ja-JP',
  sourceValue: 'Companies',
  canonicalValue: 'Companies',
  value: '会社',
  provenance: MetadataTranslationProvenance.WORKSPACE,
  __typename: 'MetadataTranslation',
};

describe('MetadataTranslationValueCell', () => {
  it('keeps editing while Enter or Escape is handled by an IME composition', async () => {
    const onSave = jest.fn().mockResolvedValue(undefined);

    render(
      <MetadataTranslationValueCell row={translatedRow} onSave={onSave} />,
    );

    await userEvent.click(screen.getByText('会社'));

    const input = screen.getByRole('textbox');

    await userEvent.clear(input);
    await userEvent.type(input, '取引先');
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true });
    fireEvent.keyDown(input, { key: 'Escape', isComposing: true });

    expect(input).toHaveFocus();
    expect(onSave).not.toHaveBeenCalled();

    await userEvent.type(input, '{Enter}');

    await waitFor(() => expect(onSave).toHaveBeenCalledWith('取引先'));
  });
});
