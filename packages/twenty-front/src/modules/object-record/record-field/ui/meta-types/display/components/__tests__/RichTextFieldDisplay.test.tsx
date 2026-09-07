import { render, screen } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { RichTextFieldDisplay } from '@/object-record/record-field/ui/meta-types/display/components/RichTextFieldDisplay';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldRichTextMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { FieldMetadataType } from '~/generated-metadata/graphql';

const RECORD_ID = 'recordId';

const richTextFieldDefinition: FieldDefinition<FieldRichTextMetadata> = {
  fieldMetadataId: 'fieldMetadataId',
  label: 'Body',
  iconName: 'IconAlignLeft',
  type: FieldMetadataType.RICH_TEXT,
  defaultValue: { blocknote: null, markdown: null },
  metadata: {
    fieldName: 'bodyV2',
  },
};

describe('RichTextFieldDisplay', () => {
  it('renders strikethrough on closed-cell preview text', () => {
    resetJotaiStore();
    jotaiStore.set(recordStoreFamilyState.atomFamily(RECORD_ID), {
      __typename: 'Note',
      id: RECORD_ID,
      bodyV2: {
        blocknote: JSON.stringify([
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'cancelled meeting',
                styles: { strike: true },
              },
            ],
          },
        ]),
        markdown: null,
      },
    });

    const Wrapper = ({ children }: { children: ReactNode }) => (
      <JotaiProvider store={jotaiStore}>
        <FieldContext.Provider
          value={{
            fieldDefinition: richTextFieldDefinition,
            recordId: RECORD_ID,
            isLabelIdentifier: false,
            isRecordFieldReadOnly: false,
          }}
        >
          {children}
        </FieldContext.Provider>
      </JotaiProvider>
    );

    render(<RichTextFieldDisplay />, { wrapper: Wrapper });

    expect(screen.getByText('cancelled meeting')).toHaveStyle({
      textDecorationLine: 'line-through',
    });
  });
});
