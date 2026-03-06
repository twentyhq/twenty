import { renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';

import { useGetObjectRecordIdentifierByNameSingular } from '@/object-metadata/hooks/useGetObjectRecordIdentifierByNameSingular';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
);

describe('useGetObjectRecordIdentifierByNameSingular', () => {
  beforeEach(() => {
    jotaiStore.set(
      objectMetadataItemsState.atom,
      generatedMockObjectMetadataItems,
    );
  });

  it('should work as expected', async () => {
    const { result, rerender } = renderHook(
      ({
        record,
        objectNameSingular,
      }: {
        record: any;
        objectNameSingular: string;
      }) => {
        return useGetObjectRecordIdentifierByNameSingular(true)(
          record,
          objectNameSingular,
        );
      },
      {
        wrapper: Wrapper,
        initialProps: {
          record: { id: 'recordId' } as any,
          objectNameSingular: 'blocklist',
        },
      },
    );

    expect(result.current.linkToShowPage).toBe('/object/blocklist/recordId');

    rerender({
      record: { id: 'recordId', avatarUrl: 'https://fake-url.com' },
      objectNameSingular: 'opportunity',
    });

    expect(result.current.linkToShowPage).toBe('/object/opportunity/recordId');

    rerender({
      record: {
        id: 'recordId',
        name: { firstName: 'John', lastName: 'Connor' },
      },
      objectNameSingular: 'person',
    });

    expect(result.current.linkToShowPage).toBe('/object/person/recordId');
    expect(result.current.name).toBe('John Connor');
    expect(result.current.avatarType).toBe('rounded');

    rerender({
      record: {
        id: 'recordId',
        domainName: 'https://cool-company.com',
      },
      objectNameSingular: 'company',
    });

    expect(result.current.linkToShowPage).toBe('/object/company/recordId');
    expect(result.current.avatarUrl).toBe(
      'https://twenty-icons.com/cool-company.com',
    );
    expect(result.current.avatarType).toBe('squared');
  });
});
