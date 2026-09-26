import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { FieldMetadataSettingsOnClickAction } from 'twenty-shared/types';

import { linksFieldDefinition } from '@/object-record/record-field/ui/__mocks__/fieldDefinitions';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useGetSecondaryFieldButton } from '@/object-record/record-field/ui/hooks/useGetSecondaryFieldButton';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';

jest.mock('@/activities/emails/hooks/useOpenEmailInAppOrFallback', () => ({
  useOpenEmailInAppOrFallback: () => ({ openEmail: jest.fn() }),
}));

jest.mock('~/hooks/useCopyToClipboard', () => ({
  useCopyToClipboard: () => ({ copyToClipboard: jest.fn() }),
}));

const recordId = 'recordId';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>
    <FieldContext.Provider
      value={{
        fieldDefinition: {
          ...linksFieldDefinition,
          metadata: {
            ...linksFieldDefinition.metadata,
            settings: { clickAction: FieldMetadataSettingsOnClickAction.COPY },
          },
        },
        recordId,
        isLabelIdentifier: false,
        isRecordFieldReadOnly: false,
      }}
    >
      {children}
    </FieldContext.Provider>
  </JotaiProvider>
);

describe('useGetSecondaryFieldButton', () => {
  it('opens a Links value without giving the new tab access to the opener', () => {
    const windowOpenSpy = jest
      .spyOn(window, 'open')
      .mockImplementation(() => null);

    act(() => {
      jotaiStore.set(recordStoreFamilyState.atomFamily(recordId), {
        id: recordId,
        links: {
          primaryLinkUrl: 'example.com',
          primaryLinkLabel: '',
          secondaryLinks: [],
        },
        __typename: 'Company',
      });
    });

    const { result } = renderHook(() => useGetSecondaryFieldButton(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current[0].onClick();
    });

    expect(windowOpenSpy).toHaveBeenCalledWith(
      'https://example.com',
      '_blank',
      'noopener,noreferrer',
    );

    windowOpenSpy.mockRestore();
  });
});
